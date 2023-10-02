# ModuleMeteoSHT31 - Логотип
////

# Лицензия
////

# Описание
<div style = "font-family: 'Open Sans', sans-serif; font-size: 16px; color: #555">

Модуль реализует базовые функции метеодатчика на базе чипа [SHT31](https://github.com/AlexGlgr/ModuleMeteoSHT31/blob/fork-Alexander/res/sht31_datasheet.pdf), возращающего данные о температуре и относительной влажности воздуха. Модуль работает по протоколу I2C, разработан в соответсвии с нотацией архитектуры фреймворка EcoLite и является потомком класса [ClassMiddleSensor](https://github.com/Nicktonious/ModuleSensorArchitecture/blob/main/README.md). Количество каналов для снятия данных - 2. Типовая погрешность измерений датчика: 0.2°С для температуры и 0.2% для влажности (подробнее в документации чипа).

### **Конструктор**
Конструктор принимает 1 объект типа **SensorOptsType** и 1 объект типа **SensorPropsType**.
Пример *_opts* типа [**SensorOptsType**](https://github.com/Nicktonious/ModuleSensorArchitecture/blob/main/README.md):
```js
const _opts = {
    bus: i2c_bus,
    address: 0x44,
    repeatability: 'LOW'
    quantityChannel: 2
}
```
- <mark style="background-color: lightblue">bus</mark> - объект класса I2C, возвращаемый диспетчером I2C шин - [I2Cbus](https://github.com/AlexGlgr/ModuleBaseI2CBus/blob/fork-Alexander/README.md);
- <mark style="background-color: lightblue">address</mark> - адрес датчика на шине;
- <mark style="background-color: lightblue">repeatability</mark> - повторяемость датчика (см. документацию на датчик);
- <mark style="background-color: lightblue">quantityChannel</mark> - количество каналов.

### **Поля**
- <mark style="background-color: lightblue">_name</mark> - имя класса в строковом виде;
- <mark style="background-color: lightblue">_sensor</mark> - объект базового класса;
- <mark style="background-color: lightblue">_minPeriod</mark> - минимальная частота опроса датчика - 1000 мс;
- <mark style="background-color: lightblue">_usedChannels</mark> - используемые каналы данных по нотации архитектуры фреймворка EcoLite;
- <mark style="background-color: lightblue">_interval</mark> - функция SetInterval для опроса датчика.

### **Методы**
- <mark style="background-color: lightblue">Init(_sensor_props)</mark> - метод обязывающий провести инициализацию датчика настройкой необходимых для его работы регистров;
- <mark style="background-color: lightblue">Reset()</mark> - метод сбрасывает датчик в состояние по-умолчанию;
- <mark style="background-color: lightblue">Start(_num_channel, _period)</mark> - метод запускает циклический опрос определенного канала датчика с заданной периодичностью в мс. Переданное значение периода сверяется с минимальным значением, хранящимся в поле *_minPeriod*, и, если требуется, регулируется;
- <mark style="background-color: lightblue">ChangeFrequency(_num_channel, _period)</mark> - метод останавливает опрос указанного канала и запускает его вновь с уже новой частотой.
- <mark style="background-color: lightblue">Stop(_num_channel)</mark> - метод прекращает считывание значений с заданного канала.

### **Возвращаемые данные**
Датчик предоставляет данные об относительной влажности воздуха в процентах от 0% до 100%, и температуру окружающей среды от 0 до 90 градусов по шкале цельсия. Перевода значений температуры в другую шкалу выполняется по следующим формулам:
- В Кельвины: t + 273.15;
- В Фарегейты: (t * 9/5) + 32;


### **Примеры**
Пример программы для вывода данных раз в одну секунду:
```js
//Подключение необходимых модулей
const ClassI2CBus = require("ClassI2CBus");
const err = require("ModuleAppError");
const NumIs = require("ModuleAppMath");
     NumIs.is();
const Sht = require("ClassSHT31");

//Создание I2C шины
let I2Cbus = new ClassI2CBus();
let _bus = I2Cbus.AddBus({sda: P5, scl: P4, bitrate: 100000}).IDbus;

//Настройка передаваемых объектов
let opts = {bus: _bus, address: 0x44, repeatability: 'LOW', quantityChannel: 2};
let sensor_props = {
    name: "SHT31",
    type: "sensor",
    channelNames: ['temperature', 'humidity'],
    typeInSignal: "analog",
    typeOutSignal: "digital",
    quantityChannel: 2,
    busType: [ "i2c" ],
    manufacturingData: {
        IDManufacturing: [
            {
                "ModuleSD": "32-016"
            }
        ],
        IDsupplier: [
            {
                "MSD_Suppl": "B01"
            }
        ],
        HelpSens: "SHT31 Meteo sensor"
    }
};
//Создание объекта класса
let meteo = new Sht(opts, sensor_props);

//Создание каналов
const ch0 = meteo.GetChannel(0);
const ch1 = meteo.GetChannel(1);
ch0.Start(1000);
ch1.Start(1000);

setInterval(() => {
  console.log(ch0.Value + "C");
  console.log(ch1.Value + "%");
}, 1000);
```

Пример перевода полученной температуры с *ch0* в Кельвины:
```js
...
let meteo = new Sht(opts, sensor_props);

const ch0 = meteo.GetChannel(0);

ch0.Start(1000);

console.log((ch0.Value + 273.15) + "K");
```
</div>