# ModuleSensorArchitecture
////

# Лицензия
////

# Описание
<div style = "font-family: 'Open Sans', sans-serif; font-size: 16px; color: #555">

Набор классов, обеспечивающих функционал датчика можно условно разделить на такие части: 
- Основная, которая состоит из ветки в виде двух обобщенных классов. От этой ветки и наследуется класс конкретного датчика.
- Сервисная, реализующая математико-логический аппарат для обработки и корректировки поступаемых значений. 
- Прикладная - класс, отвечающий за отдельно взятый канал датчика. Этот класс реализуется вне данного стека.

### **ClassAncestorSensor** 
Самый "старший" предок в иерархии классов датчиков. В первую очередь собирает в себе самые базовые данные о датчике: переданные шину, пины и тд. Так же сохраняет его описательную характеристику: имя, тип вх. и вых. сигналов, типы шин которые можно использовать, количество каналов и тд.


### **Конструктор**
Конструктор принимает 1 объект типа **SensorPropsType** и 1 объект типа **SensorOptsType**.

- <mark style="background-color: lightblue">bus</mark> - объект класса I2C, возвращаемый диспетчером I2C шин - [I2Cbus](https://github.com/AlexGlgr/ModuleBaseI2CBus/blob/fork-Alexander/README.md);
- <mark style="background-color: lightblue">address</mark> - адрес датчика на шине;
- <mark style="background-color: lightblue">repeatability</mark> - повторяемость датчика (см. документацию на датчик);

### **Поля**
- <mark style="background-color: lightblue">_Bus</mark> - используемая шина;
- <mark style="background-color: lightblue">_Pins</mark> - массив используемых датчиком пинов;
- <mark style="background-color: lightblue">_Address</mark> - адресс датчика на шине;
- <mark style="background-color: lightblue">_Name</mark> - имя датчика;
- <mark style="background-color: lightblue">_Type</mark> - для всех датчиков имеет значение "sensor";
- <mark style="background-color: lightblue">_ChannelNames</mark> - массив с названиями каналов;
- <mark style="background-color: lightblue">_TypeInSensor_</mark> - тип входного сигнала;
- <mark style="background-color: lightblue">_TypeOutSensor</mark> - тип выходного сигнала;
- <mark style="background-color: lightblue">_QuantityChannel</mark> - число физических каналов датчика;
- <mark style="background-color: lightblue">_BusTypes</mark> - массив со строковыми представлениями типов шин, на которых может работать датчик;
- <mark style="background-color: lightblue">_ManufacturingData</mark> - ...;

### **Методы**
- <mark style="background-color: lightblue">InitSensProps(_sensor_props)</mark> - Метод инициализирует поля, хранящие описательные характеристики датчика.

- <mark style="background-color: lightblue">Init(_sensor_props)</mark> - метод обязывающий провести инициализацию датчика настройкой необходимых для его работы регистров;
- <mark style="background-color: lightblue">Reset()</mark> - метод сбрасывает датчик в состояние по-умолчанию;
- <mark style="background-color: lightblue">Start(_num_channel, _period)</mark> - метод запускает циклический опрос определенного канала датчика с заданной периодичностью в мс. Переданное значение периода сверяется с минимальным значением, хранящимся в поле *_minPeriod*, и, если требуется, регулируется;
- <mark style="background-color: lightblue">ChangeFrequency(_num_channel, _period)</mark> - метод останавливает опрос указанного канала и запускает его вновь с уже новой частотой.
- <mark style="background-color: lightblue">Stop(_num_channel)</mark> - метод прекращает считывание значений с заданного канала.


### **Примеры**

Пример параметра *_sensor_props* типа **SensorPropsType**: 
```js
const _sensor_props = {
    name: "VL6180",                
    type: "sensor",
    channelNames: ['light', 'range'],
    typeInSignal: "analog",
    typeOutSignal: "digital",
    busType: ["i2c"],
    manufacturingData: {
        IDManufacturing: [
            { "Amperka": "AMP-B072" }
        ],
        IDsupplier: [
            { "Amperka": "AMP-B072" }
        ],
        HelpSens: "Proximity sensor"
    }
};
```

Параметр *_opts* типа **SensorOptsType**:
```js
const _opts = {
    bus: i2c_bus,      //объект шины
    pins: [B14, B15],       //массив используемых пинов 
}
```

Так как ClassAncestorSensor прмиеняется исключительно в роли родительского класса, его наследники обязаны иметь такие же параметры конструктора, которые передаются в супер-конструктор таким образом:
```js
ClassAncestorSensor.apply(this, [_sensor_props, _opts]);
```

### **ClassMiddleSensor** 
Класс, наследующийся от **ClassAncestorSensor**. Закладывает в будущие классы датчиков поля и методы, необходимые для унификации хранения значений, полученных с каналов. Вводит реализации возможности выделения из объекта "реального" датчика объектов-каналов, которые сам же при инициализации создает и хранит в поле *_Channels*.
Если при инициализации класса-предка тот получил корректное значение *_QuantityChannel*, то:
1. в конструкторе вызываются необходимые инструкции для автоматического создания аксессоров по паттерну `Ch0_Value`, `Ch1_Value` и тд., в зависимости от количества каналов. Данные аксессоры во первых, служат единой прослойкой, через которую проходят данные и соответственно лишь в сеттере можно лакончино и своевременно прогнать данные через лимиты, корректирующие функции и зоны измерения и их обработчики. "Под капотом" геттеров лежит не просто числовая переменная, в которую присваивается значение, а кольцевой буффер, который работает с массивом значений, который в дальнейшем будет передаваться в функции-фильтры. Таким образом в более высокоуровневом коде запись и чтение значений должны выполняться исключительно через эти аксессоры.
Изменение глубины фильтра (макс.кол-ва значений, хранящихся в буффере совершается вызовом метода `SetFilterDepth(_num)`)
2. поле-массив *_Channels* заполняется объектами типа **ClassChannel**. 

</div>