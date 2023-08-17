import { ClassChannel, ClassAlarms, ClassLimits } from './ChannelBranch.mjs';
/**
 * @class 
 * Самый "старший" предок в иерархии классов датчиков. 
 * В первую очередь собирает в себе самые базовые данные о датчике: его имя, тип вх. и вых. сигналов и проч.
 */
class ClassAncestorSensor {
    constructor(_sensor_props) {
        this._Name = _sensor_props.Name;
        this._Type = _sensor_props.Type;
        this._ChannelNames = _sensor_props.ChannelNames;
        this._TypeInSignal = _sensor_props.TypeInSignal;
        this._TypeOutSignal = _sensor_props.TypeOutSignal
        // this._NumMinPortsRequired = 2; //TODO: обдумать
        this._QuantityChannel = _sensor_props.QuantityChannel;
        this._BusType = _sensor_props.BusType;
        this._ManufacturingData = _sensor_props.ManufacturingData;
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
        // ClassAncestorSensor.apply(this, _sensor_props);
        super(_sensor_props);
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


export { ClassAncestorSensor, ClassMiddleSensor };