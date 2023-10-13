<div style = "font-family: 'Open Sans', sans-serif; font-size: 16px">

# ModuleSensor
<div style = "color: #555">
    <p align="center">
    <img src="./res/logo.png" width="400" title="hover text">
    </p>
</div>


## Лицензия
////

## Описание
<div style = "color: #555">

Модуль Sensor предназначен для обеспечения разработчиков функционалом для удобной и эффективной работы с датчиками в рамках фреймворка EcoLight. 
Наделяет датчики полями и методами, которые покрывают типовые задачи идентификации, управления и считывания данных. Для этого **ModuleSensor** создает унифицированный интерфейс, разделяя объект датчика на измерительные каналы. 
Каждый канал представляет собой отдельную измеряемую датчиком величину и функционал, относящийся к считыванию и обработке этой величины.
Данный подход обеспечивает единообразное взаимодействие с различными типами датчиков, упрощая процесс учета, сбора данных, делегирования команд, а так же сокращая время разработки новых модулей под конкретные модели датчиков. 

Заложенный в модуль функционал включает в себя поэтапную автоматическую обработку значений измерений датчика, что повышает надежность и удобство работы. Этот процесс включает в себя несколько этапов:
- Супрессия: выходные данные подвергаются ограничению с использованием ограничительных функций. Это обеспечивает то, что значения с датчика находятся в заданных пределах, что позволяет учесть границы работы датчика или предотвратить определенные ошибки; 
- Трансформация линейной функцией: в случаях, когда значения с датчика требуют преобразования (например, для корректировки либо перевода значений в другие единицы измерения), применяется линейная функция. Эта функция корректирует значения согласно коэффициентам, которые задает пользователь;
- Фильтрация: для снижения влияния шумов и искажений на измерения применяется фильтрация данных. Этот этап помогает получить стабильные и плавные данные от датчиков;
- Проверка зоны измерений: значения с датчика сверяются с зонами измерений, настраиваемые пользователем. Если значение выходит за пределы заданных зон, это активировать соответствующие реакции в виде коллбэков.

Набор классов, обеспечивающих функционал датчика можно условно разделить на такие части: 
- Основная, которая состоит из ветки в виде двух классов, хранящих в себе поля и методы, общие для всех датчиков. От этой ветки и наследуется класс конкретного датчика;
- Сервисная, реализующая математико-логический аппарат для обработки и корректировки поступаемых значений;
- Прикладная - класс, отвечающий за отдельно взятый канал датчика. Этот класс реализуется вне данного стека.
<div style = "color: #555">

### ClassAncestorSensor 
<div style = "color: #555">

Базовый класс в представленной иерархии. Является отправной точкой для создания объектов конкретных датчиков и обеспечивает сбор и хранение информации о них. Его поля предоставляют основные характеристики, необходимые для идентификации и настройки датчика в рамках модуля ModuleSensor. В первую очередь собирает в себе самые базовые сведения о датчике: переданные в его конструктор параметры и описательную характеристику. Перечень полей см. ниже

### Конструктор
<div style = "color: #555">

Конструктор принимает два параметра: объект типа **SensorPropsType** и объект типа **SensorOptsType**.

Пример параметра *_sensor_props* типа **SensorPropsType**: 
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
Пример параметра *_opts* типа **SensorOptsType**:
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

### Методы
<div style = "color: #555">

- <mark style="background-color: lightblue">InitSensProps(_sensor_props)</mark> - инициализирует поля, хранящие описательные характеристики датчика.

### Примеры
<div style = "color: #555">

**ClassAncestorSensor** применяется исключительно в роли родительского класса и не используется независимо. Потому наследники обязаны иметь такие же параметры конструктора, который ввиду особенностей среды выполнения Espruino вызывается таким образом:
```js
ClassAncestorSensor.apply(this, [_sensor_props, _opts]);
```

### ClassMiddleSensor
<div style = "color: #555">

Представляет собой ключевую составляющую рассматриваемой архитектуры классов. Смысл этого класса заключается в унификации работы с датчиками и их каналами, обеспечивая легкость и надежность взаимодействия прикладных разработчиков с датчиками в рамках фрейморка EcoLight. Наследуется от **ClassAncestorSensor**.
Реализует важнейшие принципы **ModuleSensor**:
- Унификация хранения значений: **ClassMiddleSensor** организует хранение считанных значений с датчика в виде аксессоров (*Ch0_Value*, *Ch1_Value* и тд.), которые ссылаются на кольцевой буффер, созданный под каждый канал. Это обеспечивает единый интерфейс для работы с различными датчиками и их каналами.
- Обработка данных через аксессоры: упомянутые выше аксессоры служат единой прослойкой, через которую проходят данные, позволяя применять ограничительные функции, корректировочную линейную функцию, фильтрацию и проверку на нахождение в заданных зонах измерения. Это обеспечивает надежную и легко расширяемую обработку данных с датчика.
- Автоматическое создание каналов: при инициализации "реального" датчика класс **ClassMiddleSensor** автоматически создает объекты-каналы (см.параграф **ClassChannel**), которые композируются в поле этого класса. Это упрощает создание и управление каналами датчика.
- Определение сигнатур методов: класс **ClassMiddleSensor** определяет сигнатуры основных методов, которые будут доступны для работы с "реальными" датчиками и их каналами. Это обеспечивает единый интерфейс для инициализации, запуска, настройки и управления датчиками.

### Поля
<div style = "color: #555">

- <mark style="background-color: lightblue">_Values</mark> - массив с объектами, реализующими кольцевой буффер;
- <mark style="background-color: lightblue">_Channels</mark> - массив с автоматически инстанцирующимися объектами ClassChannel;
- <mark style="background-color: lightblue">_IsChUsed</mark> - массив булевых значений, в котором i-й элемент указывает запущен ли в данный момент опрос i-го канала.

### Аксессоры
<div style = "color: #555">

- <mark style="background-color: lightblue">Ch*N*_Value</mark> - геттер/сеттер в который **необходимо** записывать полученные с датчика необработанные значения  и с него же далее необходимо их считывать. В этом сеттере "сырое" значение автоматически проходит через все этапы обработки, включая фильтр (см. диаграмму "Обработка значений с датчика" ниже);
- <mark style="background-color: lightblue">CountChannels</mark> - геттер, возвращающий количество корректно инициализированных каналов типа **ClassChannel**.

### Методы
<div style = "color: #555">

- <mark style="background-color: lightblue">InitСhannels(_sensor_props)</mark> - обязывает провести инициализацию датчика настройкой необходимых для его работы регистров;
- <mark style="background-color: lightblue">GetChannel(_ch_num)</mark> - возвращает объект i-го канала;
- <mark style="background-color: lightblue">SetFilterDepth(_ch_num, _depth)</mark> - устанавливает глубину фильтруемых значений - изменяет количество значений, хранящихся в кольцевом буффере (_Values[i]) в момент времени; 
- <mark style="background-color: lightblue">Init(_opts)</mark> - обязывает провести инициализацию датчика настройкой необходимых для его работы регистров;
- <mark style="background-color: lightblue">Start(_ch_num, [_period], [_opts])</mark> - обязывает запустить циклический опрос определенного канала датчика с заданной периодичностью в мс. Переданное значение периода должно сверяться с минимальным значением для данного канала и, если требуется, регулироваться, так как максимальная частота опроса зависит от характеристик датичка. 
В некоторых датчиках считывание значений с нескольких каналов происходит неразрывно и одновременно. В таких случаях ведется только один циклический опрос, а повторный вызов метода Start() для конкретного канала лишь определяет, будет ли в процессе опроса обновляться значение данного канала;
- <mark style="background-color: lightblue">Stop(_ch_num)</mark> - обязывает прекратить считывание значений с заданного канала. В случаях, когда значения данного канала считываются синхронно с другими, достаточно прекратить обновление данных;
- <mark style="background-color: lightblue">ChangeFreq(_ch_num, _period)</mark> - обязывает останавливить опрос указанного канала и запустить его вновь с уже новой частотой. Возобновиться должно обновление всех каналов, которые опрашивались перед остановкой;
- <mark style="background-color: lightblue">ConfigureRegs(_opts)</mark> - обязывает выполнить дополнительную конфигурацию датчика. Это может быть настройка пина прерывания, периодов измерения и прочих шагов, которые в общем случае необходимы для работы датчика, но могут переопределяться в процессе работы, и потому вынесены из метода Init();
- <mark style="background-color: lightblue">Reset()</mark> - обязывает выполнить перезагрузку датчика;
- <mark style="background-color: lightblue">SetRepeatability(_rep)</mark> - обязывает устанавить значение повторяемости
- <mark style="background-color: lightblue">SetPrecision(_pres)</mark> - обязывает устанавливить точность измерений;
- <mark style="background-color: lightblue">Run(_ch_num, [_opts])</mark> - обязывает запустить прикладную работу датчика, сперва выполнив его полную инициализацию, конфигурацию и прочие необходимые процедуры, обеспечив его безопасный и корректный запуск;
- <mark style="background-color: lightblue">Read(_reg)</mark> - обязывает реализовать чтение с регистра;
- <mark style="background-color: lightblue">Write(_reg, _val)</mark> - обязывает реализовать запись в регистр.

### ClassChannel
<div style = "color: #555">

Класс, представляющий каждый отдельно взятый канал датчика. В парадигме фрейморка EcoLight именно через объект этого класса происходит прикладная работа с датчком. Является "синглтоном" для основного объекта датчика. Хранит в себе ссылки на основной объект сенсора и "проброшенные" методы для работы с данным каналом датчика, включая аксессоры. 
Также **ClassChannel** композирует в себе сервисные классы (см. **ClassDataRefine** и **ClassAlarms**) которые безусловно используются в аксессорах **ClassMiddleSensor** при обработке считываемых с датчика значений.

### Поля
<div style = "color: #555">

- <mark style="background-color: lightblue">_ThisChannel</mark> - ссылка на основной объект датчика;
- <mark style="background-color: lightblue">_NumChannel</mark> - номер канала;
- <mark style="background-color: lightblue">_DataRefine</mark> - объект класса ClassDataRefine;
- <mark style="background-color: lightblue">_Alarms</mark> - объект класса ClassAlarms;

### Аксессоры
<div style = "color: #555">

- <mark style="background-color: lightblue">Value</mark> - ссылается на аксессор Ch*N*_Value (N = this._NumChannel) основного объекта датичка. Сбор данных предусмотрен только через этот аксессор; 
- <mark style="background-color: lightblue">CountChannels</mark> - возвращает количество корректно инициализированных каналов типа **ClassChannel**;
- <mark style="background-color: lightblue">ID</mark> - возвращает идентификатор датичка (канала);
- <mark style="background-color: lightblue">IsUsed</mark> - возвращает *true* если канал уже опрашивается, иначе - false.

### Методы
<div style = "color: #555">

- <mark style="background-color: lightblue">Start([_period], [_opts])</mark>
- <mark style="background-color: lightblue">Stop()</mark> 
- <mark style="background-color: lightblue">ChangeFreq(_period)</mark>
- <mark style="background-color: lightblue">Run([_opts])</mark>
- <mark style="background-color: lightblue">ConfigureRegs()</mark>

Более развернутое описание методов см. выше

### Примеры
<div style = "color: #555">

```js
//Создание объекта класса
//*VL610 - класс, который наследуется от ClassMiddleSensor *
let vl6180 = new VL6180(opts, sensor_props);

//Сохранение ссылок на каналы в переменные
const ch0 = vl6180.GetChannel(0);
const ch1 = vl6180.GetChannel(1);

//Установка для 1-го канала корректирующей функции f(x) = 0.1 * x 
//для преобразования итогового значения в см из мм.
ch1._DataRefine.SetTransmissionOut(0.1, 0);
//Установка для 1-го канала ограничителей в 0.5 и 20 см
ch0._DataRefine.SupressOutValue(0.5, 20);
//Установка глубины фильтрации для 0-го канала
ch0._DataRefine.SetFilterDepth(5);

ch1._Alarms.SetZones({
    red: {
        low:    5, 
        high:   Infinity, 
        cbLow:  () => { console.log('OBSTACLE VERY CLOSE'); }, 
        cbHigh: () => { console.log('OBSTACLE NEAR'); }
    },
    green: {
        cb: () =>     { console.log('NO OBSTACLES AHEAD')}
    }
})
//Запуск опроса обоих канала
ch0.Start();
ch1.Start();

//Вывод показаний с датчика раз в 1 сек.
setInterval(() => {
    if (ch0.IsUsed)
        console.log(ch0.Value + " lux");
    if (ch1.IsUsed)
        console.log(ch1.Value + " cm");
}, 1000);

//Прекращение опроса 0-го канала через 5 сек.
setTimeout(() => {
    ch0.Stop();
}, 5000);
//Прекращение опроса 1-го канала через 10 сек.
setTimeout(() => {
    ch1.Stop();
}, 10000);
```
Результат выполнения:
<div align='center'>
    <img src="./res/example-1.png" alt="Image not found">
</div>

### ClassDataRefine
<div style = "color: #555">

Назначение класса заключается в обеспечении математической обработкисчитанных с датчика значений. **ClassDataRefine** позволяет настроить для отдельно взятого канала:
- Функцию-фильтр;
- Ограничение входных значений;
- Коеффициенты корректирующей линейной Функции.
Объект класса автоматически инициализируется в поле *_DataRefine* класса **ClassChannel**. Методы для преобразования данных вызываются также автоматически из аксессоров типа *Ch0_Value*

### Поля
<div style = "color: #555">

- <mark style="background-color: lightblue">_Values</mark> - массив с используемыми коэффициентами;
- <mark style="background-color: lightblue">_FilterFunc</mark> - функция которая вызывается из ClassMiddleSensor и применяется для фильтрации значений. По фильтр-функция по умолчанию возвращает усредненное значение;

### Методы
<div style = "color: #555">

- <mark style="background-color: lightblue">SetFilterFunc(_func)</mark> - устанавливает фильтрующую функцию для канала;
- <mark style="background-color: lightblue">SetOutLim(_limLow, _limHigh)</mark> - устанавливает значения ограничителей входных значений;
- <mark style="background-color: lightblue">SupressOutValue(val)</mark> - устанавливает значения ограничителей супрессорной функции;
- <mark style="background-color: lightblue">SetTransmissionOut(_k, _b)</mark> - устанавливает коэффициенты k и b трансформирующей функции канала;
- <mark style="background-color: lightblue">TransformOutValue(val)</mark> - возвращает значение, прошедшее через коэффициенты трансформирующей функции.

<div align='center'>
    <img src="./res/math.png" alt="Image not found">
</div>

### Обработка значений с датчика
<div style = "color: #555">

<div align='center'>
    <img src="./res/data_transformation.png" alt="Image not found">
</div>

### Примеры
<div style = "color: #555">

Смена единицы измерения температуры на ходу с помощью настройки линейной функции:
```js
//Инициализация канала, измеряющего температуру в °C 
const temperatuteCh = meteoSensor.GetChannel(num);

//Запуск и вывод показаний
ch.Start();
setInterval(() => {
    console.log(`Value = ${temperatureCh.Value}`);
}, 2000);

setTimeout(() => {
    //Настройка перевода значений в Фаренгейты
    ch._DataRefine.SetTransmissionOut(1.8, 32);
}, 6000);

//Установка супрессорных ограничителей
ch._DataRefine.SupressOutValue(30, 250);
```

### ClassAlarms
<div style = "color: #555">

Класс реализует определение измерительных зон канала. 
Измерительные зоны представляют собой определенные диапазоны значений, в пределах которых измерительное оборудование, такое как датчики или сенсоры, выполняет измерения и считывает данные. В SCADA системах измерительные зоны часто используются для определения нормального и ненормального состояния системы, а также для установления граничных значений, в пределах которых параметры должны находиться.
Алармы представляют собой механизмы оповещения или предупреждения, которые срабатывают, когда измеренные значения выходят за пределы заданных. 

<div align='center'>
    <img src="./res/zones_low_res.png" alt="Image not found">
</div>

### Поля
<div style = "color: #555">

- <mark style="background-color: lightblue">_Zones</mark> - массив со значениями границ, которые задают зоны измерения;
- <mark style="background-color: lightblue">_Callbacks</mark> - массив с коллбэками к измерительным зонам;
- <mark style="background-color: lightblue">_CurrZone</mark> - строковое представление текущей зоны.

### Методы
<div style = "color: #555">

- <mark style="background-color: lightblue">SetZones(opts)</mark> - задает зоны измерения и их функции-обработчики
- <mark style="background-color: lightblue">CheckZone(opts)</mark> - обновляет значение текущей зоны измерения по переданному значению и, если зона сменилась, вызывает её колбэк.

### Примеры
<div style = "color: #555">

Замечание! Передаваемые значения *low* и *high* не являются левой и правой границами зоны. *low* указывает значение, ниже которого начинается нижняя красная/желтая зона, а *high* - значение выше готорого идёт верхняя красная/жёлтая зона. При чем зона ВСЕГДА задается парой значений, а если же для прикладной работы необходима только верхняя либо нижняя зоны, то рудиментарную зону всегда можно стянуть в недостижимое значение.  
Правила, задания значений:
- red.low < yellow.low
- red.high > yellow.high
- при повторном вызове `SetZones()` проверка значений на валидность происходит таким образом: 
    1. новые значения желтой/красной зон сверяются со значениями красной/желтой зон если такие также были переданы
    2. если же была передана только красная либо желтая зона, то ее значения сверяются со значениями зон, указанными прежде. 
- коллбэки при вызове получают как аргумет значение предыдущей зоны.

```js
//Установка всех зон сразу
ch0._Alarms.SetZones({         
    red: {              //Красная зона
        low:   -100, 
        high:   100, 
        cbLow:  (prev) => { console.log('L_RED'); }, 
        cbHigh: (prev) => { console.log('H_RED'); }
    },
    yellow: {           //Желтая зона
        low:   -50, 
        high:   50, 
        cbLow:  (prev) => { console.log('L_YELLOW'); }, 
        cbHigh: (prev) => { console.log('H_YELLOW'); } 
    },
    green: {            //Зеленая зона
        cb:     (prev) => { console.log(`Left ${prev} zone, now in GREEN zone`); } 
    }
});

//Установка зон по отдельности
ch1._Alarms.SetZones({         
    red: {              //Красная зона
        low:   -100, 
        high:   100, 
        cbLow:  () => { console.log('L_RED'); }, 
        cbHigh: () => { console.log('H_RED'); }
    }
});

//Для примера установка желтой зоны пропускается

ch1._Alarms.SetZones({
    green: {            //Зеленая зона
        cb: (prevZone) => { console.log(`Left ${prevZone}, now GREEN zone`); } 
    }
});
```
</div>

### Зависимости
<div style = "color: #555">

- <mark style="background-color: lightblue">[**ClassAppError**](https://github.com/Konkery/ModuleAppError/blob/main/README.md)</mark>
</div>

</div>
    