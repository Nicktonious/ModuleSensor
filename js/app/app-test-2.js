const err = require('M_AppError');
require('M_AppMath').is();

const ClassI2C = require('M_I2CBus');
//const ClassMiddleSensor = require('ClassSensor.min.js');
//const ClassVL6180 = require('M_VL6180');

const I2Cbus = new ClassI2C();
const bus = I2Cbus.AddBus({sda: B15, scl: B14, bitrate: 100000 }).IDbus;
const sensor_props = ({
    name: "SHT31",
    type: "sensor",
    channelNames: ['temperature', 'humidity'],
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
        HelpSens: "Temperature and humidity sensor"
    }
});

const ClassSHT = require('ClassSHT31.min.js');
const sht = new ClassSHT(sensor_props, {
                            bus: bus, 
                            pins: [],
                            repeatability: 'LOW',
                            address: 0x44}
  );
const temprtCh = sth.GetChannel(0);

//Запуск и вывод показаний
temprtCh.Start();
let post = '°C';
setInterval(() => {
    console.log(`Value = ${(temperatureCh.Value).toFixed(2)} ${post}`);
}, 2000);

setTimeout(() => {
    //Настройка перевода значений в Фаренгейты
    temprtCh._DataRefine.SetTransmissionOut(1.8, 32);
    post = 'F';
}, 4000);
