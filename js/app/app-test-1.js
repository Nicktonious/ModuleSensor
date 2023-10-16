const err = require('M_AppError');
require('M_AppMath').is();

const ClassI2C = require('M_I2CBus');
const ClassMiddleSensor = require('ClassSensor.min.js');
const ClassVL6180 = require('M_VL6180');

const I2Cbus = new ClassI2C();
const bus = I2Cbus.AddBus({sda: B15, scl: B14, bitrate: 100000 }).IDbus;
const sensor_props = ({
    name: "VL6180",
    type: "sensor",
    channelNames: ['light', 'range'],
    typeInSignal: "analog",
    typeOutSignal: "digital",
    quantityChannel: 2,
    busTypes: ["i2c"],
    manufacturingData: {
        IDManufacturing: [
            { "Adafruit": "4328435534" }  
        ],
        IDsupplier: [
            { "Adafruit": "4328435534" }  
        ],
        HelpSens: "Proximity sensor"
    }
});

const vl6180 = ClassVL6180.setup(sensor_props, {
                            bus: bus, 
                            pins: [] }); 
const ch0 = vl6180.GetChannel(0);
const ch1 = vl6180.GetChannel(1);

//Установка для 1-го канала корректирующей функции f(x) = 0.1 * x 
//для преобразования итогового значения в см из мм.
ch1._DataRefine.SetTransformFunc(0.1, 0);
//Установка для 1-го канала ограничителей в 0.5 и 20 см
ch1._DataRefine.SetLim(0.5, 20);
//Установка глубины фильтрации для 0-го канала
ch0.SetFilterDepth(5);

ch1._Alarms.SetZones({
    red: {
        low:    5, 
        high:   Infinity, 
        cbLow:  () => { console.log('OBSTACLE VERY CLOSE: ' + ch1.Value + " cm"); }, 
        cbHigh: () => { console.log('OBSTACLE NEAR'); }
    },
    green: {
        cb: () =>     { console.log('NO OBSTACLES AHEAD')}
    }
});

// Запуск опроса обоих канала
ch0.Start();
ch1.Start();

//Вывод показаний с датчика раз в 1 сек.
setInterval(() => {
    if (ch0.IsUsed)
        console.log(ch0.Value + " lux");
    if (ch1.IsUsed)
        console.log(ch1.Value + " mm");
        console.log('\n');
}, 1000);

//Прекращение опроса 0-го канала через 5 сек.
setTimeout(() => {
    ch0.Stop();
    console.log("ch0 stopped");
}, 3000);
//Прекращение опроса 1-го канала через 10 сек.
setTimeout(() => {
    ch1.Stop();
    console.log("ch1 stopped");
}, 10000);

