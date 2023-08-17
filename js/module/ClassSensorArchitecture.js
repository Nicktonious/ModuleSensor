
/**
 * @class 
 * Самый "старший" предок в иерархии классов датчиков. 
 * В первую очередь собирает в себе самые базовые данные о датчике: его имя, тип вх. и вых. сигналов и проч.
 */
class ClassAncestorSensor {
    constructor(_sensor_props) {
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
     * @param {Object} _sensor_props 
     * @param {InitArgs} _opts 
     */
    constructor(_opts, _sensor_props) {
        ClassAncestorSensor.apply(this, _sensor_props);
        this._Values = [];
        this._Channels = new Array(this._QuantityChannel).fill({ _Limits: new ClassLimits(),
                                                                 _Alarms: new ClassAlarms() });
        // this._Channels = [];
        // for (let i = 0; i < this._QuantityChannel; i++) {
        //     this._Channels[i] = new ClassChannel(this, i);
        // }
        
        for (let i = 0; i < this._QuantityChannel; i++) {
            Object.defineProperty(this, `Ch${i}_Value`, {
                get: () => this._Values[i],
                set: val => {
                    val = this._Channels[i]._Limits.HandleOutValue(val);

                    this._Channels[i]._Alarms.Handle(val);

                    this._Values[i] = val;
                }
            });
        }
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
    Init() { }
    Start() { }
    Stop() { }
    Reset() { }
    Run() { }
    ChangeFrequency() { }
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
        if (!sensor)                                             throw new Error('Sensor object is null or undefined');             
        if (!(sensor instanceof ClassMiddleSensor))              throw new Error('Object does not inherit from ClassMiddleSensor');
        if (num < 0 || num >= sensor._QuantityChannel)           throw new Error('Incorrect channel num');
        
        if (sensor._Channels[num] instanceof ClassChannel) return sensor._Channels[num];    //если объект данного канала однажды уже был иницииализирован, то вернется ссылка, хранящаяся в объекте физического сенсора  

        this._ThisSensor = sensor;          //ссылка на объект физического датчика
        this._NumChannel = num;             //номер канала (начиная с 1)
        this._Limits = new ClassLimits();
        this._Alarms = new ClassAlarms();

        ['Init', 'Start', 'Stop', 'Reset', 'Run', 'ChangeFrequeny']
        .filter(prop => typeof sensor[prop] === 'function')
        .forEach(prop => this[prop] = sensor[prop].bind(sensor));
        
        sensor._Channels[num] = this;
    }

    get Value() { return this._ThisSensor._Values[this._NumChannel]; }  //вых значение канала

    get ThisSensor() { return this._ThisSensor; } 

    get ID() { return this._ThisSensor._Name + this._NumChannel; }
}
/**
 * @class
 * Класс реализующий функционал для обработки числовых значений по задаваемым ограничителям (лимитам) и заданной линейной функции
 */
class ClassLimits {
    constructor() {
        this._Limits = [];  // [ outLimLow, outLimHigh, inLimLow, outLimHigh ]
        // this.SetInLim();
        this.SetOutLim();
        this.SetTransmissionOut();
    }
    /**
     * @method
     * Возвращает пару числовых значений, прошедших валидацию.
     * @param {Number} _limLow 
     * @param {Number} _limHigh 
     * @returns 
     */
    GetLimsPair(_limLow, _limHigh) {
        let limLow = _limLow || -Infinity;;
        let limHigh = _limHigh || Infinity;

        if ( typeof (limLow) !== "number" ) {
            limLow = -Infinity; //все равно присвоить значение по умолчанию и выбросить исключение
            
            throw new Error('Not a number');
        }
        //обработать второй аргумент
        if ( typeof (limHigh) !== "number" ) {
            limHigh = Infinity; //все равно присвоить значение по умолчанию и выбросить исключение
            
            throw new Error('Not a number');
        }

        if (limLow >= limHigh) throw new Error('limLow value shoud be less than limHigh');

        return [limLow, limHigh];
    }
    
    SetInLim(_limLow, _limHigh) {
        const lims = this.GetLimsPair(_limLow, _limHigh);
        this._Limits[2] = lims[0];
        this._Limits[3] = lims[1];
    }
    /**
     * @method
     * Метод устанавливает значения ограничителей выходных значений.
     * @param {Number} _limLow 
     * @param {Number} _limHigh 
     */
    SetOutLim(_limLow, _limHigh) {
        const lims = this.GetLimsPair(_limLow, _limHigh);
        this._Limits = lims[0];
        this._Limits = lims[1];
    }

    HandleInValue(val) {
        return val < this._Limits[2] ? this._Limits[2]
             : val > this._Limits[3] ? this._Limits[3]
             : val;
    }
    /**
     * @method
     * Метод возвращает значение, прошедшее через ограничители и передаточные коэффициенты функции вых.значений  
     * @param {Number} val 
     * @returns {Number}
     */
    HandleOutValue(val) {
        val = val * this._K + this._B;
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
        const k = _k || 1;
        const b = _b || 0;
        if (typeof k !== 'number' || typeof b !== 'number') throw new Error();
        this._K = k;
        this._B = b;
    }
}
/**
 * @class
 * Класс реализующий функционал для работы с тревогами (алармами) 
 * Хранит в себе заданные границы алармов и соответствующие им колбэки
 */
class ClassAlarms {
    constructor() {
        //TODO: add proper validation of numbers

        this._ZoneType = (low, high, cb) => ({
            low: low || -Infinity,     
            high: high || Infinity,
            callback: cb || (x => x),
    
            is(val) {       //проверка на то, принадлежит ли числовое значение зоне аларма 
                return val >= this.high || val <= this.low;
            } 
        });
        this._Zones = { red: this._ZoneType(), yellow: this._ZoneType(), green: { callback: x => x } };

        this._CurrentZone = '';     //'red' 'yellow' 'green'
    } 

    /**
     * @method
     * Метод устанавливает границы и колбэк желтой зоны
     * @param {Number} _low 
     * @param {Number} _high 
     * @param {Function} _callback 
     */
    SetYellowZone(_low, _high, _callback) {
        if (typeof _low !== 'number'|| typeof _high !== 'number' || _low >= _high) throw new Error();
        if (this._Zones.red.isUsed &&
           (_low <= this._Zones.red.low || _high >= this._Zones.red.high)) throw new Error(); 
        this._Zones.yellow = this._ZoneType(_low, _high, _callback);
        this._Zones.yellow.isUsed = true;
    }
    /**
     * @method
     * Метод устанавливает границы и колбэк красной зоны
     * @param {Number} _low 
     * @param {Number} _high 
     * @param {Function} _callback 
     */
    SetRedZone(_low, _high, _callback) {
        if (typeof _low !== 'number'|| typeof _high !== 'number' || _low >= _high) throw new Error();
        if (this._Zones.yellow.isUsed && 
           (_low >= this._Zones.yellow.low || _high <= this._Zones.yellow.high)) throw new Error(); 
        this._Zones.red.isUsed = true; 
        this._Zones.red = this._ZoneType(_low, _high, _callback);
    }
    /**
     * @method
     * Метод определяет колбэк, вызываемый при возвращении в зеленую зону. Так как границы зеленой зоны зависят от границ желтой/зеленой зоны, колбэк является единственным аргументом
     * @param {Function} _callback 
     */
    SetGreenZone(_callback) {
        if (typeof _callback !== 'function') throw new Error();
        this._Zones.green = { callback: _callback };  
    }
    /**
     * @method
     * Метод получает вых. значение канала, определяет активную зону и если зона поменялась, то вызывается соответсвующий колбэк 
     * @param {Number} val 
     */
    Handle(val) {
        let zone = this._Zones.red.is(val) ? 'red'       //определение зоны
                 : this._Zones.yellow.is(val) ? 'yellow'
                 : 'green';
        if (zone !== this._CurrentZone) {                //если зона поменялась
            this._CurrentZone = zone;
            this._Zones[zone].callback(val);
        }
    }
}

exports = { ClassSensor: ClassMiddleSensor };