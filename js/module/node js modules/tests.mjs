import { ClassAncestorSensor, ClassMiddleSensor } from "./MainBranch.mjs";

import { ClassChannel, ClassLimits, ClassAlarms } from "./ChannelBranch.mjs";
let p = {
    _Name: "SHT31",
    _Type: "sensor",
    _ChannelNames: ['temperature', 'humidity'],
    _TypeInSignal: "analog",
    _TypeOutSignal: "digital",
    // this._NumMinPortsRequired = 2; //TODO: обдумать
    _QuantityChannel: 2,
    _BusType: [ "i2c" ],
    _ManufacturingData: {
        IDManufacturing: [
            {
                "Amperka": "AMP-B072"
            }
        ],
        IDsupplier: [
            {
                "Amperka": "AMP-B072"
            }
        ],
        HelpSens: "SHT31 Meteo sensor"
    }
};
let a = new ClassMiddleSensor({}, p);
ClassMiddleSensor.prototype.Start = function(a, b) {
    return Array.from(arguments).reduce((pr, curr) => pr+curr, '');
}
console.log(a.Start(1, 2));
[a._Values[0], a._Values[1]] = [0, 54];
let virtual = new ClassChannel(a, 0);
console.log(virtual.Start(1,2));
a.Ch0_Value = 0;


// virtual._Alarms.SetYellowZone(2, 3, x => {console.log("YELLOW");});
// virtual._Alarms.SetRedZone(-1, 7, x => {console.log('RED');})
// virtual._Alarms.SetGreenZone(x => {console.log("GREEN");});
// a.Ch0_Value = 4;
// a.Ch0_Value = 2.5;
// a.Ch0_Value = -2;
// // a.Ch0_Value = 10
// // a.Ch0_Value = 6

