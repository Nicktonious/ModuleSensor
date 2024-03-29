/**
 * @typedef SensorPropsType - объект хранящий описательные характеристики датчика
 * @property {String} id
 * @property {String} article
 * @property {String} name
 * @property {String} type
 * @property {[String]} channelNames
 * @property {String} typeInSignal
 * @property {String} typeOutSignal
 * @property {[String]} busTypes
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
     * @property {Number} [address] - адрес устройства на шине
     */
    /**
     * @constructor
     * @param {SensorPropsType} _sensor_props - объект с описательными характеристиками датчика, который передается в метод InitSensProperties
     * @param {SensorOptsType} _opts - объект который содержит минимальный набор параметров, необходимых для обеспечения работы датчика
     */
    constructor(_opts, _sensor_props) { 
        this._Bus = _opts.bus;
        this._Pins = _opts.pins || [];
        if (typeof _opts.address == 'number') this._Address = _opts.address;

        this.InitSensProperties(_sensor_props);
    }
    /**
     * @method
     * Метод инициализирует поля, хранящие описательные характеристики датчика.
     * @param {SensorPropsType} sensor_props 
     */
    InitSensProperties(_sensorProps) { 
        this._Id                = _sensorProps.id;
        this._Article           = _sensorProps.article;
        this._QuantityChannel   = _sensorProps.quantityChannel;
        this._Name              = _sensorProps.name
        this._Type              = _sensorProps.type;
        this._MinRange          = _sensorProps.minRange;
        this._MaxRange          = _sensorProps.maxRange;
        this._TypeInSignal      = _sensorProps.typeInSignal;
        this._TypeOutSignal     = _sensorProps.typeOutSignal;
        this._ChannelNames      = _sensorProps.channelNames;
        this._BusTypes          = _sensorProps.busTypes;
        this._ManufacturingData = _sensorProps.manufacturingData || {};
        
        const isStrArr = (arr) => {
            if (Array.isArray(arr)) {
                return arr.every(i => typeof i === 'string');
            }
            return false;
        }

        let isValid = {
            _Id: (p) => typeof p === 'string' && p.length > 0,
            _Article: (p) =>       !p || typeof p === 'string' && p.length > 0,
            _Name: (p) =>          !p || typeof p === 'string', 
            _Type: (p) =>          !p || typeof p === 'string',
            _QuantityChannel: (p) => typeof p === 'number' && p > 0,
            _TypeInSignal: (p) =>  !p || typeof p === 'string',
            _TypeOutSignal: (p) => !p || typeof p === 'string',
            _ChannelNames: (p) =>  !p || isStrArr(p),
            _BusTypes: (p) =>      !p || Array.isArray(p),
            _MinRange: (p) => {
                return (!p || (Array.isArray(p) && typeof p[0] === 'number' && typeof p[1] === 'number'));
            },
            _MaxRange: (p) => {
                return (!p || (Array.isArray(p) && typeof p[0] === 'number' && typeof p[1] === 'number'));
            },
            _ManufacturingData: (p) => !p || typeof p === 'object'
        };

        Object.keys(isValid).forEach(propName => {
            if (!isValid[propName](this[propName])) throw new Error(`Invalid prop: ${propName}`);
        });
    }
}
const SensorStatus = {
    OFF: 0,
    WORKING: 1,
    TRANSITION: 2
};
/**
 * @class
 * Класс, который закладывает в будущие классы датчиков поля и методы, необходимые для унификации хранения данных, связанных с отдельными 
 * каналами (вых. значения и коэффициенты для их обработки). Вводит реализации возможности выделения из объекта "реального" датчика объектов-каналов.
 */
class ClassMiddleSensor extends ClassAncestorSensor {
    /**
     * @constructor
     * @param {SensorPropsType} _sensor_props 
     * @param {SensorOptsType} _opts
     */
    constructor(_opts, _sensor_props) {
        ClassAncestorSensor.apply(this, [_opts, _sensor_props]);
        
        this._Channels = [];
        this._ChStatus = [];

        this._IsChUsed = [];
        this._IsChAvailable = [];

        this.InitChannels();
    }
    static get SensorStatus() {
        return SensorStatus;
    }
    get ID() { return this._Id; }
    /**
     * @getter
     * Возвращает количество созданных объектов каналов датчика.
     */
    get CountChannels() {
        return this._Channels.filter(o => o instanceof ClassChannelSensor).length;
    }
    /**
     * @method
     * Возвращает объект соответствующего канала если он уже был инстанцирован. Иначе возвращает null
     * @param {Number} _num - номер канала
     * @returns {ClassChannelSensor}
     */
    GetChannel(_num) {
        const num = _num;
        if (this._Channels[num] instanceof ClassChannelSensor) return this._Channels[num];
        return null;
    }
    /**
     * @method
     * Метод инициализирует поля, геттеры и сеттеры необходимые для  организации хранения и использования данных с каналов датчика.
     */
    InitChannels() {
        /**
         * Примечание! Объявление аксессоров инкапсулируется внутрь функции, так как еще на espruino версии 2.13 область видимости локальных переменных действует не совсем так как в node js, 
         * в связи с чем в блоке кода под Object.defineProperty(... значение i не остается константным и изменение i в теле/условии цикла ломает логику в коде аксессора 
         */
        const defineAccessors = i => {
            Object.defineProperty(this, `Ch${i}_Value`, {       //определяем геттеры и сеттеры по шаблону "Ch0_Value", "Ch1_Value" ...
                set: val => {
                    this._Channels[i].AddRawValue(val);
                }
            });
        }

        for (let i = 0; i < this._QuantityChannel; i++) {
            
            this._Channels[i] = new ClassChannelSensor(this, i);  // инициализируем и сохраняем объекты каналов

            defineAccessors(i);

            this._IsChUsed[i] = false;
            this._IsChAvailable[i] = true;

            this._ChStatus[i] = SensorStatus.OFF;
        }
    }
    /**
     * @method
     * Метод обязывающий провести инициализацию датчика настройкой необходимых для его работы регистров 
     * @param {Object} [_opts] 
     */
    Init(_opts) { }
    /**
     * @method
     * Метод обязывает запустить циклический опрос определенного канала датчика с заданной периодичностью в мс. Переданное значение периода должно сверяться с минимальным значением для данного канала и, если требуется, регулироваться, так как максимальная частота опроса зависит от характеристик датчика. 
     * 
     * В некоторых датчиках считывание значений с нескольких каналов происходит неразрывно и одновременно. В таких случаях ведется только один циклический опрос, а повторный вызов метода Start() для конкретного канала лишь определяет, будет ли в процессе опроса обновляться значение данного канала.
     * 
     * Для тех датчиков, каналы которых не могут опрашиваться одновременно, реализация разных реакций на повторный вызов метода выполняется с помощью параметра _opts
     * 
     * @param {Number} _ch_num - номер канала 
     * @param {Number} [_period] - период опроса в мс
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
     * Метод обязывает остановить опрос указанного канала и запустить его вновь с уже новой частотой. Возобновиться должно обновление всех каналов, которые опрашивались перед остановкой.  
     * @param {Number} _ch_num - номер канала, частота опроса которого изменяется
     * @param {Number} _period - новый период опроса
     */
    ChangeFreq(_ch_num, _period) { }
    /**
     * @method
     * Метод обязывающий выполнить дополнительную конфигурацию датчика. Это может быть настройка пина прерывания, периодов измерения и прочих шагов, которые в общем случае необходимы для работы датчика, но могут переопределяться в процессе работы, и потому вынесены из метода Init() 
     * @param {Object} [_opts] - объект с конфигурационными параметрами
     */
    Configure(_opts) { }
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
class ClassChannelSensor {
    /**
     * @constructor
     * @param {ClassMiddleSensor} sensor - ссылка на основной объект датчика
     * @param {Number} num - номер канала
     */
    constructor(sensor, num) {
        if (sensor._Channels[num] instanceof ClassChannelSensor) return sensor._Channels[num];    //если объект данного канала однажды уже был создан, то вернется ссылка, хранящаяся в объекте физического сенсора  
        this._Value = 0;
        this._ThisSensor = sensor;          //ссылка на объект физического датчика
        this._ValueBuffer = {
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
        this._NumChannel = num;             //номер канала (начиная с 1)
        this._DataRefine = new ClassDataRefine();
        this._Alarms = null;
        this._DataUpdated = false;
        this._DataWasRead = false;
    }
    /**
     * @getter
     * Возвращает значение канала, хранящееся в основном объекте
     */
    get Value() { // вых значение канала
        this._DataUpdated = false;
        if (this._DataWasRead) return this._Value;

        this._DataWasRead = true;
        this._Value = this._DataRefine._FilterFunc(this._ValueBuffer._arr.map(val => {
            val = this._DataRefine.TransformValue(val);
            val = this._DataRefine.SuppressValue(val);
            return val;
        }));
        return this._Value;
    }
    get IsUsed() { return this._ThisSensor._IsChUsed[this._NumChannel]; }
    /**
     * @getter
     * Указывает, можно ли в данный момент работать с каналом сенсора
     * @returns {Boolean}
     */
    get IsAvailable() { return this._ThisSensor._IsChAvailable[this._NumChannel]; }
    /**
     * @method
     * Инициализирует ClassAlarms в полях объекта.  
     */ 
    EnableAlarms() {
        this._Alarms = new ClassAlarms(this);
        if (!this.Alarms) Object.defineProperty(this, 'Alarms', { 
            get: () => this._Alarms
        });
    }
    /**
     * @method
     * Добавляет сырое значение с датчика в буфер  
     * @param {Number} val 
     */
    AddRawValue(val) {
        this._ValueBuffer.push(val);
        this._DataUpdated = true;
        this._DataWasRead = false;
        if (this._Alarms) this._Alarms.CheckZone(this.Value);
    }
    /**
     * @getter
     * Возвращает уникальный идентификатор канала
     */
    get ID() { return `${this._ThisSensor.ID}-${('0'+this._ThisSensor._QuantityChannel).slice(-2)}-${('0'+this._NumChannel).slice(-2)}`; }
    
    get Status() {
        return this._ThisSensor._ChStatus[this._NumChannel];
    }
    get DataRefine() { return this._DataRefine; }
    /**
     * @method
     * Метод обязывает запустить циклический опрос определенного канала датчика с заданной периодичностью в мс. Переданное значение периода должно сверяться с минимальным значением для данного канала и, если требуется, регулироваться, так как максимальная частота опроса зависит от характеристик датчика. 
     * 
     * В некоторых датчиках считывание значений с нескольких каналов происходит неразрывно и одновременно. В таких случаях ведется только один циклический опрос, а повторный вызов метода Start() для конкретного канала лишь определяет, будет ли в процессе опроса обновляться значение данного канала.
     * 
     * Для тех датчиков, каналы которых не могут опрашиваться одновременно, реализация разных реакций на повторный вызов метода выполняется с помощью параметра _opts
     * 
     * @param {Number} [_period] - период опроса в мс
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
     * Останавливает цикл, ответственный за опрос указанного канала и запускает его вновь с уже новой частотой. Возобновиться должно обновление всех каналов, которые опрашивались перед остановкой.  
     * @param {Number} _period 
     */
    ChangeFreq(_period) { return this._ThisSensor.ChangeFreq.call(this._ThisSensor, Array.from(arguments)); }
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
        this._ValueBuffer._depth = _depth;
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
    Configure(_opts) {
        return this._ThisSensor.Configure.apply(this._ThisSensor, Array.from(arguments));
    }
}
/**
 * @class
 * Класс реализующий функционал для обработки числовых значений по задаваемым ограничителям (лимитам) и заданной линейной функции
 */
class ClassDataRefine {
    constructor() {
        this._Values = [];  //[ 0 : outLimLow, 1: outLimHigh 2: _k, 3: _b ]
        this._FilterFunc = arr => arr[arr.length-1];

        this.SetLim(-Infinity, Infinity);
        this.SetTransformFunc(1, 0);
    }
    /**
     * @method
     * Метод устанавливает фильтрующую функцию для канала
     * @param {Function} _func 
     * @returns 
     */
    SetFilterFunc(_func) {
        if (!_func) {        //если _func не определен, то устанавливается функция-фильтр по-умолчанию
            this._FilterFunc = arr => arr[arr.length-1];
            return true;
        }
        if (typeof _func !== 'function') throw new Error('Not a function');
        this._FilterFunc = _func;
        return true;
    }
    /**
     * @method
     * Метод устанавливает границы супрессорной функции
     * @param {Number} _limLow 
     * @param {Number} _limHigh 
     */
    SetLim(_limLow, _limHigh) {
        if (typeof _limLow !== 'number' || typeof _limHigh !== 'number') throw new Error('Not a number');

        if (_limLow >= _limHigh) throw new Error('limLow value should be less than limHigh');
        this._Values[0] = _limLow;
        this._Values[1] = _limHigh;
        return true;
    }
    /**
     * @method
     * Метод возвращает значение, прошедшее через супрессорную функцию
     * @param {Number} val 
     * @returns {Number}
     */
    SuppressValue(val) {
        return E.clip(val, this._Values[0], this._Values[1]);
    }
    /**
     * @method
     * Устанавливает коэффициенты k и b трансформирующей линейной функции 
     * @param {Number} _k 
     * @param {Number} _b 
     */
    SetTransformFunc(_k, _b) {
        if (typeof _k !== 'number' || typeof _b !== 'number') throw new Error('Not a number');
        this._Values[2] = _k;
        this._Values[3] = _b;
        return true;
    } 
    /**
     * @method
     * Возвращает значение, преобразованное линейной функцией
     * @param {Number} val 
     * @returns 
     */
    TransformValue(val) {
        return val * this._Values[2] + this._Values[3];
    }
}
const indexes = { redLow: 0, yelLow: 1, green: 2, yelHigh: 3, redHigh: 4 };
/**
 * @class
 * Реализует функционал для работы с зонами и алармами 
 * Хранит в себе заданные границы алармов и соответствующие им колбэки.
 * Границы желтой и красной зон определяются вручную, а диапазон зеленой зоны фактически подстраивается под желтую (или красную если желтая не определена).
 * 
 */
class ClassAlarms {
    constructor(_channel) {
        this._Channel = _channel;
        this.Init();
    }
    /**
     * @method
     * Устанавливает значения полей класса по-умолчанию
     */
    Init() {
        this._Zones = [];
        this._Callbacks = new Array(5).fill((ch, z) => {});
        this._CurrZone = 'green';
    }
    /**
     * @method
     * Метод, который задает зоны измерения и их функции-обработчики
     * @param {Object} opts 
     */
    SetZones(opts) {
        const checkParams = {   // объект в котором каждой задаваемой зоне соответствует функция, которая возвращает true если параметры, зад зоны валидны
            green: () => (typeof opts.green.cb === 'function'),
            yellow: () => (opts.yellow.low < opts.yellow.high),
            red: () => (opts.red.low < opts.red.high)
        };
        ['red', 'yellow', 'green'].filter(zoneName => opts[zoneName]).forEach(zoneName => {
            if (!checkParams[zoneName]) throw new Error('Incorrect args');
        });

        if (opts.yellow) {
            if (opts.red) {
                if (opts.yellow.low < opts.red.low || opts.yellow.high > opts.red.high) throw new Error('Invalid args');
            }
            else if (opts.yellow.low < this._Zones[indexes.redLow] || opts.yellow.high > this._Zones[indexes.redHigh]) throw new Error('Invalid args');
            this._Zones[indexes.yelLow] = opts.yellow.low;
            this._Zones[indexes.yelHigh] = opts.yellow.high;
            this._Callbacks[indexes.yelLow] = opts.yellow.cbLow;
            this._Callbacks[indexes.yelHigh] = opts.yellow.cbHigh;
        }
        if (opts.red) {
            if (opts.yellow) {
                if (opts.red.low > opts.yellow.low || opts.red.high < opts.yellow.high) throw new Error('Invalid args');
            }
            else if (opts.red.low > this._Zones[indexes.yelLow] || opts.red.high < this._Zones[indexes.yelHigh]) throw new Error('Invalid args');
            this._Zones[indexes.redLow] = opts.red.low;
            this._Zones[indexes.redHigh] = opts.red.high;
            this._Callbacks[indexes.redLow] = opts.red.cbLow;
            this._Callbacks[indexes.redHigh] = opts.red.cbHigh;
        }
        if (opts.green) {
            this._Callbacks[indexes.green] = opts.green.cb;
        }
    }
    /**
     * @method
     * Метод обновляет значение текущей зоны измерения по переданному значению и, если зона сменилась, вызывает её колбэк
     * @param {Number} val 
     */
    CheckZone(val) {
        let prevZone = this._CurrZone;
        this._CurrZone = val < this._Zones[indexes.redLow]  ? 'redLow'
                       : val > this._Zones[indexes.redHigh] ? 'redHigh'
                       : val < this._Zones[indexes.yelLow]  ? 'yelLow'
                       : val > this._Zones[indexes.yelHigh] ? 'yelHigh'
                       : 'green';

        if (prevZone !== this._CurrZone) {
            this._Callbacks[indexes[this._CurrZone]](this._Channel, prevZone);
        }
    }
}
exports = ClassMiddleSensor;
// exports = { ClassMiddleSensor: ClassMiddleSensor };