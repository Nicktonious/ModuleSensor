const indexes = { redLow: 0, yelLow: 1, green: 2, yelHigh: 3, redHigh: 4 };
/**
 * @typedef SensorPropsType - объект хранящий описательные характеристики датчика
 * @property {String} name
 * @property {String} type
 * @property {[String]} channelNames
 * @property {String} typeInSignal
 * @property {String} typeOutSignal
 * @property {String} busType
 * @property {Object} manufacturingData
 */
/**
 * @class 
 * Самый "старший" предок в иерархии классов датчиков. 
 * В первую очередь собирает в себе самые базовые данные о датчике: переданные шину, пины и тд. Так же сохраняет его описательную характеристику: имя, тип вх. и вых. сигналов, типы шин которые можно использовать, количество каналов и тд.
 */
class ClassAncestorSensor {
    /**
     * @typedef SensorOptsType
     * @property {any} bus - шина
     * @property {[Pin]} pins - массив пинов
     * @property {Number} quantityChannel - количество каналов датчика 
     */
    /**
     * @constructor
     * @param {SensorOptsType} _opts - объект который содержит минимальный набор параметров, необхходимых для обеспечения работы датчика
     * @param {SensorPropsType} [_sensor_props] - объект с описательными характеристиками датчика, который передается в метод InitSensProperties
     */
    constructor(_opts, _sensor_props) { 
        if (!_opts.bus instanceof I2C) throw new Error('Not an I2C bus');
        _opts.pins.forEach(pin => {
            if (!(+Pin(pin))) throw new Error('Not a pin');
        });
        if (typeof _opts.quantityChannel !== 'number' || _opts.quantityChannel < 1) throw new Error('Invalid QuantityChannel arg ');

        this._Bus = _opts.bus;
        this._Pins = _opts.pins;
        this._QuantityChannel = _opts.quantityChannel;

        if (_sensor_props) this.InitSensProperties(_sensor_props);
    }
    /**
     * @method
     * Метод сохраняет в виде полей общие характеристики датчика (_sensor_props)
     * @param {SensorPropsType} sensor_props 
     */
    InitSensProperties(sensor_props) {  
        const changeNotation = str => `_${str[0].toUpperCase()}${str.substr(1)}`;       //converts "propName" -> "_PropName"
        ['name', 'type', 'typeInSignal', 'typeOutSignal'].forEach(prop => {
            if (typeof sensor_props[prop] !== 'string') throw new Error('Incorrect sensor property');
            
            this[changeNotation(prop)] = sensor_props[prop];
        });
        
        ['channelNames', 'busType'].forEach(propArr => {
            sensor_props[propArr].forEach(strElem => {
                if (typeof strElem !== 'string') throw new Error('Incorrect sensor property');
                this[changeNotation(propArr)] = sensor_props[propArr];
            });
        });

        this._ManufacturingData = sensor_props.manufacturingData;
        this._ArePropsInited = true;
    }
}
/**
 * @class
 * Класс, который закладывает в будущие классы датчиков поля и методы, необходимые для унификации хранения данных, связанных с отдельными 
 * каналами (вых. значения и коэффициенты для их обработки). Вводит реализации возможности выделения из объекта "реального" датчика объектов-каналов.
 */
class ClassMiddleSensor extends ClassAncestorSensor {
    /**
     * @constructor
     * @param {SensorOptsType} _opts
     * @param {SensorPropsType} [_sensor_props] 
     */
    constructor(_opts, _sensor_props) {
        ClassAncestorSensor.apply(this, [_opts, _sensor_props]);
        this._Values = [];
        this._Channels = [];

        this.InitChannels();
        this._IsInited = true;
    }
    /**
     * @getter
     * Возвращает количество инстанцированных объектов каналов датчика.
     */
    get CountChannels() {
        return this._Channels.filter(o => o instanceof ClassChannel).length;
    }
    /**
     * @method
     * Возвращает объект соответствующего канала если он уже был инстанцирован. Иначе возвращает null
     * @param {Number} _num - номер канала
     * @returns {ClassChannel}
     */
    GetChannel(_num) {
        const num = _num;
        if (this._Channels[num] instanceof ClassChannel) return this._Channels[num];
        return null;
    }
    /**
     * @method
     * Метод инициализирует поля, геттеры и сеттеры необходимые для  организации хранения и использования данных с каналов датчика.
     */
    InitChannels() {
        if (this._IsInited) return;
        /**
         * Примечание! Объявление аксессоров инкапсулируется внутрь функции, так как еще на espruino версии 2.13 область видимости локальных переменных действует не совсем так как в node js, 
         * в связи с чем в блоке кода под Object.defineProperty(... значение i не остается константным и изменение i в теле/условии цикла ломает логику в коде аксессора 
         */
        const defineAccessors = i => {
            Object.defineProperty(this, `Ch${i}_Value`, {       //определяем геттеры и сеттеры по шаблону "Ch0_Value", "Ch1_Value" ...
                get: () => {
                    return this._Values[i]._arr[this._Values[i]._arr.length-1];
                },
                set: val => {
                    this._Values[i]._rawVal = val;
                    val = this._Channels[i]._Limits.SupressOutValue(val);
                    val = this._Channels[i]._Limits.CalibrateOutValue(val);

                    this._Values[i].push(val);
                    this._Channels[i]._Alarms.CheckZone(val);
                }
            });
        }

        for (let i = 0; i < this._QuantityChannel; i++) {
            try {
                this._Channels[i] = new ClassChannel(this, i);  // инициализируем и сохраняем объекты каналов
            } catch (e) {
                this._Channels[i] = null;
            }
            this._Values[i] = {
                _depth : 1,
                _rawVal : undefined,
                _arr : [],
            
                push: function(_val) {
                    while (this._arr.length >= this._depth) {
                        this._arr.shift();
                    }
                    this._arr.push(_val);
                }
            };
            defineAccessors(i);
        }
    }
    /**
     * @method 
     * Метод который устанавливает глубину фильтруемых значений - изменяет количество значений, хранящихся в кольцнвом буффере (_Values[i]) в момент времени.
     * @param {Number} _ch_num 
     * @param {Number} _depth 
     */
    SetFilterDepth(_ch_num, _depth) { 
        if (_ch_num < 0 || _ch_num >= this._QuantityChannel || _depth < 1) throw new Error('Invalid args');
        this._Values[_ch_num]._depth = _depth;
        return true;
    }
    SetZones(_ch_num, _opts) {
        if (_ch_num < 0 || _ch_num >= this._QuantityChannel || typeof _opts !== 'object') throw new Error('Invalid args');
        return this._Channels[_ch_num].SetZones(_opts);
    }
    /**
     * @method
     * Метод обязывающий провести инициализацию датчика настройкой необходимых для его работы регистров 
     * @param {Object} [_opts] 
     */
    Init(_opts) { }
    /**
     * @method
     * Метод обязывает запустить циклический опрос определенного канала датчика с заданной периодичностью в мс. Переданное значение периода должно сверяться с минимальным значением для данного канала и, если требуется, регулироваться, так как максимальная частота опроса зависит от характеристик датичка. 
     * 
     * В некоторых датчиках считывание значений с нескольких каналов происходит неразрывно и одновременно. В таких случаях ведется только один циклический опрос, а повторный вызов метода Start() для конкретного канала лишь определяет, будет ли в процессе опроса обновляться значение данного канала.
     * 
     * Для тех датчиков, каналы которых не могут опрашиваться одновременно, реализация разных реакций на повторный вызов метода выполняется с помощью параметра _opts
     * 
     * @param {Number} _ch_num - номер канала 
     * @param {Number} _period - период опроса в мс
     * @param {Object} [_opts] - необязательный параметр, позволяющий передать дополнительные аргументы
     * @returns {Boolean} 
     */
    Start(_ch_num, _period, _opts) { }
    /**
     * @method
     * Метод обязывает прекратить считывание значений с заданного канала. 
     * В случаях, когда значения данного канала считываются синхронно с другими, достаточно прекратить обновление данных.
     * @param {Number} _ch_num - номер канала, опрос которого необходимо остановить
     */
    Stop(_ch_num) { }
    /**
     * @method
     * Метод обязывает останавливить опрос указанного канала и запустить его вновь с уже новой частотой. Возобновиться должно обновление всех каналов, которые опрашивались перед остановкой.  
     * @param {Number} _ch_num - номер канала, частота опроса которого изменяется
     * @param {Number} _period - новый вериод опроса
     */
    ChangeFrequency(_ch_num, _period) { }
    /**
     * @method
     * Метод обязывающий выполнить дополнительную конфигурацию датчика. Это может быть настройка пина прерывания, периодов измерения и прочих шагов, которые в общем случае необходимы для работы датчика, но могут переопределяться в процессе работы, и потому вынесены из метода Init() 
     * @param {Object} [_opts] - объект с конфигурационными параметрами
     */
    ConfigureRegs(_opts) { }
    /**
     * @method
     * Метод обязывающий выполнить перезагрузку датчика
     */
    Reset() { }
    /**
     * @method
     * Метод устанавливающий значение повторяемости
     * @param {Number | String} _rep - повторяемость
     */
    SetRepeatability(_rep) { }
    /**
     * @method
     * Метод устанавливающий точность измерений
     * @param {Number | String} _pres - точность
     */
    SetPrecision(_pres) { }
    /**
     * @method
     * Метод который обязывает запустить прикладную работу датчика, сперва выполнив его полную инициализацию, конфигурацию и прочие необходимые процедуры, обеспечив его безопасный и корректный запуск
     * @param {Number} _ch_num - номер канала
     * @param {Object} _opts - параметры для запуска
     */
    Run(_ch_num, _opts) { }
    /**
     * @method
     * Метод обеспечивающий чтение с регистра
     * @param {Number} _reg 
     */
    Read(_reg) { }
    /**
     * @method
     * Метод обеспечивающий запись в регистр
     * @param {Number} _reg 
     * @param {Number} _val 
     */
    Write(_reg, _val) { }
}
/**
 * @class
 * Класс, представляющий каждый отдельно взятый канал датчика. При чем, каждый канал является "синглтоном" для своего родителя.  
 */
class ClassChannel {
    /**
     * @constructor
     * @param {ClassMiddleSensor} sensor - ссылка на основной объект датчика
     * @param {Number} num - номер канала
     */
    constructor(sensor, num) {
        if (sensor._Channels[num] instanceof ClassChannel) return sensor._Channels[num];    //если объект данного канала однажды уже был иницииализирован, то вернется ссылка, хранящаяся в объекте физического сенсора  

        this._ThisSensor = sensor;          //ссылка на объект физического датчика
        this._NumChannel = num;             //номер канала (начиная с 1)
        this._Limits = new ClassLimits();
        this._Alarms = new ClassAlarms();
        sensor._Channels[num] = this;
    }
    /**
     * @method
     * Метод обязывает запустить циклический опрос определенного канала датчика с заданной периодичностью в мс. Переданное значение периода должно сверяться с минимальным значением для данного канала и, если требуется, регулироваться, так как максимальная частота опроса зависит от характеристик датичка. 
     * 
     * В некоторых датчиках считывание значений с нескольких каналов происходит неразрывно и одновременно. В таких случаях ведется только один циклический опрос, а повторный вызов метода Start() для конкретного канала лишь определяет, будет ли в процессе опроса обновляться значение данного канала.
     * 
     * Для тех датчиков, каналы которых не могут опрашиваться одновременно, реализация разных реакций на повторный вызов метода выполняется с помощью параметра _opts
     * 
     * @param {Number} _ch_num - номер канала 
     * @param {Number} _period - период опроса в мс
     * @param {Object} [_opts] - необязательный параметр, позволяющий передать дополнительные инструкции
     * @returns {Boolean} 
     */
    Start(_period, _opts) {
        return this._ThisSensor.Start(this._NumChannel, _period, _opts);
    }
    /**
     * @method
     * Метод прекращает считывание значений с заданного канала. 
     * В случаях, когда значения данного канала считываются синхронно с другими, то достаточно прекратить обновление данных.
     */
    Stop() { return this._ThisSensor.Stop(this._NumChannel); }
    /**
     * @method
     * Останавивает цикл, ответственный за опрос указанного канала и запускает его вновь с уже новой частотой. Возобновиться должно обновление всех каналов, которые опрашивались перед остановкой.  
     * @param {Number} _period 
     */
    ChangeFrequency(_period) { return this._ThisSensor.ChangeFrequency.call(this._ThisSensor, Array.from(arguments)); }
    /**
     * @method
     * Выполняет перезагрузку датчика
     */
    Reset() { return this._ThisSensor.Reset.apply(this._ThisSensor, Array.from(arguments)); }
    /**
     * @method
     * Метод который устанавливает глубину фильтруемых значений
     * @param {Number} _depth 
    */
    SetFilterDepth(_depth) {
        return this._ThisSensor.SetFilterDepth(this._NumChannel, _depth);
    }
    /**
     * @method
     * Метод который обязывает начать прикладную работу датчика, сперва выполнив его полную инициализацию, конфигурацию и прочие необходимые процедуры, обеспечив его безопасный и корректный запуск
     * @param {Object} _opts - параметры для запуска
     */
    Run(_opts) { 
        const args = Array.from(arguments);
        args.unshift(this._NumChannel);
        return this._ThisSensor.Run.apply(this._ThisSensor, args);
    }
    /**
     * @method
     * Метод обязывающий выполнить конфигурацию датчика либо значениями по умолчанию, либо согласно параметру _opts 
     * @param {Object} _opts - объект с конфигурационными параметрами
     */
    ConfigureRegs(_opts) {
        return this._ThisSensor.ConfigureRegs.apply(this._ThisSensor, Array.from(arguments));
    }
    SetZones(_opts) {
        return this._Alarms.SetZones(_opts);
    }
    
    /**
     * @getter
     * Возвращает значение канала, хранящееся в основном объекте
     */
    get Value() { return this._ThisSensor[`Ch${this._NumChannel}_Value`]; }  //вых значение канала
    /**
     * @getter
     * Возвращает уникальный идентификатор канала
     */
    get ID() { return this._ThisSensor._Name + this._NumChannel; }
}
/**
 * @class
 * Класс реализующий функционал для обработки числовых значений по задаваемым ограничителям (лимитам) и заданной линейной функции
 */
class ClassLimits {
    constructor() {
        this._Limits = [];  // 0 : outLimLow, 1: outLimHigh 
        this.SetOutLim(-Infinity, Infinity);
        this.SetTransmissionOut(1, 0);
    }
    /**
     * @method
     * Метод устанавливает значения ограничителей выходных значений.
     * @param {Number} _limLow 
     * @param {Number} _limHigh 
     */
    SetOutLim(_limLow, _limHigh) {
        if (typeof _limLow !== 'number' || typeof _limHigh !== 'number') throw new Error('Not a number');

        if (_limLow >= _limHigh) throw new Error('limLow value shoud be less than limHigh');
        this._Limits[0] = _limLow;
        this._Limits[1] = _limHigh;
    }
    /**
     * @method
     * Метод возвращает значение, прошедшее через ограничители вых.значений  
     * @param {Number} val 
     * @returns {Number}
     */
    SupressOutValue(val) {
        return E.clip(val, this._Limits[0], this._Limits[1]);
    }
    /**
     * @method
     * Устанавливает коэффициенты k и b функции выходных значений канала
     * @param {Number} _k 
     * @param {Number} _b 
     */
    SetTransmissionOut(_k, _b) {
        if (typeof _k !== 'number' || typeof _b !== 'number') throw new Error();
        this._K = _k;
        this._B = _b;
    } 
    /**
     * @method
     * возвращает значение, прошедшее через коэффициенты функции вых.значений
     * @param {Number} val 
     * @returns 
     */
    CalibrateOutValue(val) {
        return val * this._K + this._B;
    }
}
/**
 * @class
 * Класс реализующий функционал для работы с тревогами (алармами) 
 * Хранит в себе заданные границы алармов и соответствующие им колбэки.
 * Границы желтой и красной зон определяются вручную, а диапазон зеленой зоны фактически подстраивается под желтую (или красную если желтая не определена).
 * 
 */
class Alarms {
    constructor() {
        this._Zones = [];
        this._Callbacks = [];
        this._CurrZone = '';
    }
    /**
     * @param {Object} opts 
     */
    SetZones(opts) {
        const checkParams = {   // объект в котором каждой задаваемой зоне соответсвует функция, которая возвращает true если параметры, зад зоны валидны
            green: () => (typeof opts.green.cb === 'function'),
            yellow: () => (opts.yellow.low < opts.yellow.high),
            red: () => (opts.red.low < opts.red.high)
        };
        ['red', 'yellow', 'green'].filter(zoneName => opts[zoneName]).forEach(zoneName => {
            if (!checkParams[zoneName]) throw new Error();
        });

        if (opts.yellow) {
            if (opts.yellow.low < this._Zones[indexes.redLow] || opts.yellow.high > this._Zones[indexes.redHigh]) throw new Error();
            this._Zones[indexes.yelLow] = opts.yellow.low;
            this._Zones[indexes.yelHigh] = opts.yellow.high;
            this._Callbacks[indexes.yelLow] = opts.yellow.cbLow;
            this._Callbacks[indexes.yelHigh] = opts.yellow.cbHigh || opts.yellow.cbLow;
        }
        if (opts.red) {
            if (opts.red.low > this._Zones[indexes.yelLow] || opts.red.high < this._Zones[indexes.yelHigh]) throw new Error();
            this._Zones[indexes.redLow] = opts.red.low;
            this._Zones[indexes.redHigh] = opts.yellow.high;
            this._Callbacks[indexes.redLow] = opts.red.cbLow;
            this._Callbacks[indexes.redHigh] = opts.red.cbHigh || opts.red.cbLow;
        }
        if (opts.green) {
            this._Callbacks[indexes.green] = opts.green.cb;
        }
    }
    GetZone(val) {
        return val < this._Zones[indexes.redLow]  ? 'redLow'
             : val > this._Zones[indexes.redHigh] ? 'redHigh'
             : val < this._Zones[indexes.yelLow]  ? 'yelLow'
             : val > this._Zones[indexes.yelHigh] ? 'yelHigh'
             : 'green';
    }
    CheckZone(val) {
        if (this.GetZone(val) !== this._CurrZone) {
            this._CurrZone = this.GetZone(val);
            this._Callbacks[indexes[this._CurrZone]]();
        }
    }
}
exports = ClassMiddleSensor;
// exports = { ClassMiddleSensor: ClassMiddleSensor };