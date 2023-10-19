<div style = "font-family: 'Open Sans', sans-serif; font-size: 16px">

# ClassAncestorSensor 
<div style = "color: #555">
    <p align="center">
    <img src="./res/logo.png" width="400" title="hover text">
    </p>
</div>

## Описание
<div style = "color: #555">

Базовый класс в стеке [ModuleSensor](./README.md). Является отправной точкой для создания объектов конкретных датчиков и обеспечивает сбор и хранение информации о них. Его поля предоставляют основные характеристики, необходимых для идентификации и настройки датчика в рамках фреймоворка EcoLight. В первую очередь собирает в себе самые базовые сведения о датчике: переданные в его конструктор параметры и описательную характеристику. Перечень полей см. ниже.
</div>

### Конструктор
<div style = "color: #555">

Конструктор принимает два параметра: объект типа **SensorPropsType** и объект типа **SensorOptsType**.

Образец параметра *_sensor_props* типа **SensorPropsType**: 
```js
const _sensor_props = {
    name: "VL6180",                     
    type: "sensor",       
    quantityChannel: 2,
    channelNames: ['light', 'range'],
    typeInSignal: "analog",            
    typeOutSignal: "digital",           
    busTypes: ["i2c"],                
    manufacturingData: {
        IDManufacturing: [                  //о производителе
            { "Adafruit": "4328435534" }    //прозводитель: артикул
        ],
        IDsupplier: [                       //о поставщике
            { "Adafruit": "4328435534" }    
        ],
        HelpSens: "Proximity sensor"        //о самом датичке
    }
};
```
Образец параметра *_opts* типа **SensorOptsType**:
```js
const _opts = {
    bus: bus,           //объект шины
    pins: [B14, B15],   //массив используемых пинов 
    address: 0x29       //адрес на шине
}
```
Также параметр *_opts* может передавать такие свойства:
- <mark style="background-color: lightblue">repeatability</mark> - повторяемость;
- <mark style="background-color: lightblue">precision</mark> - точность.
Как и свойство *address*, они не являются обязательными.
</div>

### Поля
<div style = "color: #555">

- <mark style="background-color: lightblue">_Bus</mark> - используемая шина;
- <mark style="background-color: lightblue">_Pins</mark> - массив используемых датчиком пинов;
- <mark style="background-color: lightblue">_Address</mark> - адресс датчика на шине;
- <mark style="background-color: lightblue">_Bus</mark> - используемая шина;
- <mark style="background-color: lightblue">_Repeatability</mark> - повторяемость;
- <mark style="background-color: lightblue">_Precision</mark> - точность;
- <mark style="background-color: lightblue">_Name</mark> - имя датчика;
- <mark style="background-color: lightblue">_Type</mark> - тип устройства (для всех датчиков имеет значение "sensor");
- <mark style="background-color: lightblue">_ChannelNames</mark> - массив с названиями каналов;
- <mark style="background-color: lightblue">_TypeInSensor</mark> - тип входного сигнала;
- <mark style="background-color: lightblue">_TypeOutSensor</mark> - тип выходного сигнала;
- <mark style="background-color: lightblue">_QuantityChannel</mark> - число физических каналов датчика;
- <mark style="background-color: lightblue">_BusTypes</mark> - массив со строковыми представлениями типов шин, на которых может работать датчик;
- <mark style="background-color: lightblue">_ManufacturingData</mark> - объект со сведениями о производителе и поставщике датчика, а так же его односложное описание;
</div>

### Методы
<div style = "color: #555">

- <mark style="background-color: lightblue">InitSensProps(_sensor_props)</mark> - инициализирует поля, хранящие описательные характеристики датчика.
</div>

### Примеры
<div style = "color: #555">

Данный класс применяется исключительно как звено наследования и не используется независимо. Потому наследники обязаны иметь такие же параметры конструктора, который ввиду особенностей среды выполнения Espruino вызывается таким образом:
```js
ClassAncestorSensor.apply(this, [_sensor_props, _opts]);
```
</div>

### Зависимости
<div style = "color: #555">

- <mark style="background-color: lightblue">[**ClassAppError**](https://github.com/Konkery/ModuleAppError/blob/main/README.md)</mark>
</div>

</div>