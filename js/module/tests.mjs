import { ClassAncestorSensor, ClassMiddleSensor } from "./MainBranch.mjs";

import { ClassChannel, ClassLimits, ClassAlarms } from "./ChannelBranch.mjs";
let a = new ClassMiddleSensor({_bus:'i2c'});
console.log(a._Channels[0]);
[a._Values[0], a._Values[1]] = [0, 54];
// console.log(ClassMiddleSensor);
let virtual = new ClassChannel(a, 0);

a.Ch0_Value = 0;

virtual._Alarms.SetYellowZone(2, 3, x => {console.log("YELLOW");});
virtual._Alarms.SetRedZone(-1, 7, x => {console.log('RED');})
virtual._Alarms.SetGreenZone(x => {console.log("GREEN");});
a.Ch0_Value = 4;
a.Ch0_Value = 2.5;
a.Ch0_Value = -2;
// a.Ch0_Value = 10
// a.Ch0_Value = 6


