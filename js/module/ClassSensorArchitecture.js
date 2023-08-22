/**
 * @typedef _sensor_props - объект хранящий описательные характеристики датчика
 * @property {String} _Name
 * @property {String} _Type
 * @property {[String]} _ChannelNames
 * @property {String} _TypeInSignal
 * @property {String} _TypeOutSignall
 * @property {Number} _QuantityChannel
 * @property _BusType
 * @property {Object} _ManufacturingData
 */
/**
 * @typedef _opts - объект хранящий системные сущности необходимые для инициализации и обеспечения работы датичика
 * @property {[Pin]} _Pins
 * @property {Bus} _Bus
 * @property {Number} _Address
 * @property {Number | String} _Repeatability   
 */
/**
 * @class 
 * Самый "старший" предок в иерархии классов датчиков. 
 * В первую очередь собирает в себе самые базовые данные о датчике: переданные шину, пины, адрес, повторяемость и тд. Так же сохраняет его описательную характеристику: имя, тип вх. и вых. сигналов, типы шин которые можно использовать, количество каналов и тд.
 */
class ClassAncestorSensor {
    /**
     * @constructor
     * @param {_opts} _opts 
     */
    constructor(_opts) {
        this._Bus = _opts._Bus;
        this._Pins = _opts._Pins;
        this._Address = _opts._Address;
        this._Repeatability = _opts._Repeatability;
    }
    /**
     * @method
     * Метод сохраняет в виде полей общие характеристики датчика (_sensor_props)
     * @param {_sensor_props} _sensor_props 
     */
    Init(_sensor_props) {
        this._Name = _sensor_props._Name;
        this._Type = _sensor_props._Type;
        this._ChannelNames = _sensor_props._ChannelNames;
        this._TypeInSignal = _sensor_props._TypeInSignal;
        this._TypeOutSignal = _sensor_props._TypeOutSignal
        // this._NumMinPortsRequired = 2; //TODO: обдумать
        this._QuantityChannel = _sensor_props._QuantityChannel;
        this._BusType = _sensor_props._BusType;
        this._ManufacturingData = _sensor_props._ManufacturingData;
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
     * @param {_init_object} _opts 
     * @param {Object} _sensor_props 
     */
    constructor(_opts) {
        super(_opts);
        // ClassAncestorSensor.apply(this, [_opts]);
        this._Values = [];
        this._RawValues = [];
        this._Channels = [];
        this._IsInited = false;
    }
    /**
     * @getter
     * Возвращает количество инстанцированных объектов каналов датчика
     */
    get CountChannels() {
        return this._Channels.filter(o => o instanceof ClassChannel).length;
    }
    /**
     * @method
     * Возвращает объект соответствующего канала если он уже был инстанцирован. Иначе возвращает null
     * @param {Number} _num номер канала
     * @returns {ClassChannel}
     */
    GetChannel(_num) {
        const num = _num;
        if (this._Channels[num] instanceof ClassChannel) return this._Channels[num];
        return null;
    }
    /**
     * @method
     * Метод сохраняет в виде полей общие характеристики датчика (_sensor_props), инициализирует поля, геттеры и сеттеры необходимые для организации хранения и использования данных с каналов датчика.
     * @param {_sensor_props} _sensor_props 
     */
    Init(_sensor_props) {
        if (this._IsInited) return;
        // super.Init(_sensor_props);
        ClassAncestorSensor.prototype.Init.apply(this, [_sensor_props]);
        for (let i = 0; i < this._QuantityChannel; i++) {
            try {
                this._Channels[i] = new ClassChannel(this, i);  // инициализируем и сохраняем объекты каналов
            } catch (e) {
                this._Channels[i] = null;
            }

            this._Values[i] = [];                               // инициализируем массив на позиции для каждого канала
            this._RawValues[i] = [];

            Object.defineProperty(this, `Ch${i}_Value`, {       //определяем геттеры и сеттеры по шаблону "Ch0_Value", "Ch1_Value" ...
                get: () => this._Values[i][0],                  //до введения фильтров значение хранится только в нулевой позиции
                set: val => {
                    this._RawValues[i][0] = val;

                    val = this._Channels[i]._Limits.SupressOutValue(val);
                    val = this._Channels[i]._Limits.CalibrateOutValue(val);

                    this._Values[i][0] = val;
                    this._Channels[i]._Alarms.CheckZones(val);
                }
            });
        }
        this._IsInited = true;
    }
    /**
     * @method
     * Метод который запускает циклический опрос определенного канала датчика с заданной периодичностью в мс.  При попытке задать слишком короткий период опроса, он должен автоматически повышаться в зависимости от характеристик датичка. 
     * 
     * В некоторых датчиках определенные каналы не могут опрашиваться одновременно. В таких случаях эффект от повторного вызова метода   для уже другого канала должен зависеть от параметра _mode:
     * 
     *      "force" - опрос конфликтующих каналов прекращается и запускается новый опрос заданного канала.
     *      "multy" - прекращается предыдущий и запускается новый опрос с частотой, которая позволит считывать данные со всех заданных каналов.
     *      "default" - при существовании конфликтных опросов ничего не делает и возвращает false
     * 
     * @param {Number} _ch_num номер канала 
     * @param {Number} _period период опроса в мс
     * @param {String} _mode режим
     * @returns {Boolean} 
     */
    Start(_ch_num, _period, _mode) { }
    /**
     * @method
     * Метод прекращает считывание значений с заданного канала. 
     * В случаях, когда значения данного канала считываются синхронно с другими, то достаточно прекратить обновление данных.
     * @param {Number} _ch_num - номер канала, опрос которого необходимо остановить
     */
    Stop(_ch_num) { }
    /**
     * @method
     * Останавливает цикл, ответственный за опрос указанного канала и запускает его вновь с уже новой частотой. Возобновиться должно обновление всех каналов, которые опрашивались перед остановкой.  
     * @param {Number} _ch_num - номер канала, частота опроса которого изменяется
     * @param {Number} _period - новый вериод опроса
     */
    ChangeFrequency(_ch_num, _period) { }
    /**
     * @typedef _config_data - объект, который в своих полях хранит конфигурационные параметры для служб, используемых каналом (зоны, лимиты, коэфы линейной функции) 
     * @property {[Number]} _OutLims - массив на 2 элемента с нижней и верхней границами вых.значений
     * @property {Number} _K - коэффициент k
     * @property {Number} _B - коэффициент b
     * @property {Function} _GreenZone - список аргуметов для инициализации зеленой зоны
     * @property {[Number | Function]} _YellowZone - список аргуметов для инициализации желтой зоны
     * @property {[Number | Function]} _RedZone - список аргуметов для инициализации красной зоны
     * 
     */
    /**
     * @method
     * Метод принимает объект который может хранить полями с конфигурационными значениями лимитов, коэфов функции вых значений и измерительных зон.
     * @param {Number} _ch_num - номер конфигурируемного канала 
     * @param {_config_data} _config_data объект с конфигурационными параметрами
     */
    Configure(_ch_num, _config_data) {
        let channel = this.GetChannel(_ch_num); 
        if (_config_data._OutLims)
            channel._Limits.SetOutLim(_config_data._OutLims[0], _config_data._OutLims[1]);
        if (_config_data._K || _config_data._B)
            channel._Limits.SetTransmissionOut(_config_data._K, _config_data._B);
        if (_config_data._GreenZone)
            channel._Alarms.SetGreenZone.apply(this, _config_data._GreenZone);
        if (_config_data._YellowZone)
            channel._Alarms.SetYellowZone.apply(this, _config_data._YellowZone);
        if (_config_data._RedZone)
            channel._Alarms.SetRedZone.apply(this, _config_data._RedZone);
    }
    /**
     * @method
     * Выполняет перезагрузку датчика
     */
    Reset() { }
    /**
     * @method
     * Метод который запускает цепь вызовов для начала прикладной работы датчика.
     */
    Run() { }

}
/**
 * @class
 * Класс, представляющий каждый отдельно взятый канал датчика. При чем, каждый канал является "синглтоном" для своего родителя.  
 */
class ClassChannel {
    /**
     * @constructor
     * @param {ClassMiddleSensor} sensor 
     * @param {Number} num 
     */
    constructor(sensor, num) {
        if (sensor._Channels[num] instanceof ClassChannel) return sensor._Channels[num];    //если объект данного канала однажды уже был иницииализирован, то вернется ссылка, хранящаяся в объекте физического сенсора  

        this._ThisSensor = sensor;          //ссылка на объект физического датчика
        this._NumChannel = num;             //номер канала (начиная с 1)
        this._Limits = new ClassLimits();
        this._Alarms = new ClassAlarms();
        sensor._Channels[num] = this;
    }
    // /**
    //  * @method
    //  * Метод сохраняет в виде полей общие характеристики датчика (_sensor_props), инициализирует поля, геттеры и сеттеры необходимые для организации хранения и использования данных с каналов датчика.
    //  * @param {_sensor_props} _sensor_props 
    //  * @returns 
    //  */
    // Init(_sensor_props) {
    //     return this.ThisSensor.Init();
    // }
    /**
     * @method
     * Метод который запускает циклический опрос определенного канала датчика с заданной периодичностью в мс.  При попытке задать слишком короткий период опроса, он должен автоматически повышаться в зависимости от характеристик датичка. 
     * 
     * В некоторых датчиках определенные каналы не могут опрашиваться одновременно. В таких случаях эффект от повторного вызова метода   для уже другого канала должен зависеть от параметра _mode:
     * 
     *      "force" - опрос конфликтующих каналов прекращается и запускается новый опрос заданного канала.
     *      "multy" - прекращается предыдущий и запускается новый опрос с частотой, которая позволит считывать данные со всех заданных каналов.
     *      "default" - при существовании конфликтных опросов ничего не делает и возвращает false
     * 
     * @param {Number} _period 
     * @param {String} _mode 
     */
    Start(_period, _mode) {
        return this._ThisSensor.Start(this._NumChannel, _period, _mode || 'default');
    }
    /**
     * @method
     * Метод прекращает считывание значений с заданного канала. 
     * В случаях, когда значения данного канала считываются синхронно с другими, то достаточно прекратить обновление данных.
     */
    Stop() { 
        return this._ThisSensor.Stop(this._NumChannel); 
    }
    /**
     * @method
     * Останавивает цикл, ответственный за опрос указанного канала и запускает его вновь с уже новой частотой. Возобновиться должно обновление всех каналов, которые опрашивались перед остановкой.  
     * @param {Number} _ch_num 
     */
    ChangeFrequency(_ch_num, _period) { }
    /**
     * @method
     * Выполняет перезагрузку датчика
     */
    Reset() { return this._ThisSensor.Reset(Array.from(arguments)); }
    /**
     * @method
     * Метод который запускает цепь вызовов для начала прикладной работы датчика.
     */
    Run() { return this._ThisSensor.Run(Array.from(arguments)); }
    /**
     * @method
     * Метод принимает объект который может хранить полями с конфигурационными значениями лимитов, коэфов функции вых значений и измерительных зон.
     * @param {_config_data} _config_data 
     */
    Configure(_config_data) { 
        return this._ThisSensor.Configure(this._NumChannel, _config_data);
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
        return val < this._Limits[0] ? this._Limits[0]
             : val > this._Limits[1] ? this._Limits[1]
             : val;
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
class ClassAlarms {
    constructor() {
        this._ZoneType = (low, high, cb_low, cb_high) => ({
            low: low,
            high: high,
            callbackLow: cb_low || (function (x) { }),
            callbackHigh: cb_high || cb_low || (function (x) { }),
            is: function (val) {       //проверка на то, принадлежит ли числовое значение зоне аларма 
                return val >= this.high || val < this.low;
            },
            invoke: function (val) {
                if (val >= this.high) this.callbackHigh(val);
                else this.callbackLow(val)
            }
        });
        this._Zones = { red: this._ZoneType(), yellow: this._ZoneType(), green: { invoke: x => x } };

        this._CurrentZone = 'green';     //'red' 'yellow' 'green'
    }

    /**
     * @method
     * Метод устанавливает границы и колбэки нижней и верхней желтой зоны. Если передается только один колбэк, то он будет вызыываться в обоих случаях
     * @param {Number} _low 
     * @param {Number} _high 
     * @param {Function} _callbackLow колбэк нижней желтой зоны
     * @param {Function} _callbackHigh колбэк верхней желтой зоны
     */
    SetYellowZone(_low, _high, _callbackLow, _callbackHigh) {
        if (typeof _low !== 'number' || typeof _high !== 'number' || _low >= _high) throw new Error('Invalid args');

        if (_low <= this._Zones.red.low || _high >= this._Zones.red.high) throw new Error();
        this._Zones.yellow = this._ZoneType(_low, _high, _callbackLow, _callbackHigh);
    }
    /**
     * @method
     * Метод устанавливает границы и колбэки нижней и верхней красной зоны. Если передается только один колбэк, то он будет вызыываться в обоих случаях
     * @param {Number} _low 
     * @param {Number} _high 
     * @param {Function} _callbackLow колбэк нижней красной зоны
     * @param {Function} _callbackHigh колбэк верхней красной зоны
     * 
     */
    SetRedZone(_low, _high, _callbackLow, _callbackHigh) {
        if (typeof _low !== 'number' || typeof _high !== 'number' || _low >= _high) throw new Error('Invalid args');

        if (_low >= this._Zones.yellow.low || _high <= this._Zones.yellow.high) throw new Error();
        this._Zones.red = this._ZoneType(_low, _high, _callbackLow, _callbackHigh);
    }
    /**
     * @method
     * Метод определяет колбэк, вызываемый при возвращении в зеленую зону. Так как границы зеленой зоны зависят от границ желтой/зеленой зоны, колбэк является единственным аргументом
     * @param {Function} _callback 
     */
    SetGreenZone(_callback) {
        if (typeof _callback !== 'function') throw new Error();
        this._Zones.green = { invoke: _callback };
    }
    /**
     * @method
     * Метод получает вых. значение канала, определяет активную зону и если зона поменялась, то вызывается соответсвующий колбэк 
     * @param {Number} val 
     */
    CheckZones(val) {
        let zone = this._Zones.red.is(val) ? 'red'       //определение зоны
              : this._Zones.yellow.is(val) ? 'yellow'
              : 'green';
        if (zone !== this._CurrentZone) {                //если зона поменялась
            this._CurrentZone = zone;
            this._Zones[zone].invoke(val);
        }
    }
}
exports = ClassMiddleSensor;
// exports = { ClassMiddleSensor: ClassMiddleSensor };