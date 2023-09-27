# ModuleSensorArchitecture
////

# Лицензия
////

# Описание
<div style = "font-family: 'Open Sans', sans-serif; font-size: 16px; color: #555">

ModuleSensorArchitecture - стек классов, предоставляющий разработчикам мощные инструменты для удобной и эффективной работы с датчиками в рамках фреймворка EcoLight. 
Модуль обобщает класс датчика, наделяя его полями и методами которые покрывают типовые задачи идентификации, управления и считывания данных с датчика. Для этого ModuleSensorArchitecture создает унифицированный интерфейс, разделяя объект датчика на измерительные каналы. 
Каждый канал представляет собой отдельную измеряемую датчиком величину и функционал, относящийся к считыванию и обработке этой величины.
Это все обеспечивает единообразное взаимодействие с различными типами датчиков, упрощая процесс учета, сбора данных, делегирования команд, а так же сокращая время разработки новых модулей под конкретные модели датчиков. 

Заложенный в модуль функционал включает в себя проработанную автоматическую обработку выходных значений с датчика, что повышает надежность и удобство работы. Этот процесс включает в себя несколько этапов:
- Супрессия: Входные данные подвергаются ограничению с использованием ограничительных функций. Это обеспечивает то, что выходные значения датчика находятся в заданных пределах, что позволяет учесть границы работы датчика или предотвратить определенные ошибки; 
- Калибровка линейной функцией: В случаях, когда выходные значения датчика требуют коррекции или преобразования (например, для калибровки нелинейных датчиков), применяется линейная функция. Эта функция корректирует значения согласно коэффициентам, которые задает пользователь.
- Фильтрация: Для снижения влияния шумов и искажений на измерения применяется фильтрация данных. Этот этап помогает получить стабильные и плавные данные от датчиков.
- Проверка зоны измерений: Выходные значения датчика сверяются с зонами измерений, настраиваемые пользователем. Если значение выходит за пределы заданных зон, это активировать соответствующие реакции в виде коллбэков.

Набор классов, обеспечивающих функционал датчика можно условно разделить на такие части: 
- Основная, которая состоит из ветки в виде двух обобщенных классов. От этой ветки и наследуется класс конкретного датчика.
- Сервисная, реализующая математико-логический аппарат для обработки и корректировки поступаемых значений. 
- Прикладная - класс, отвечающий за отдельно взятый канал датчика. Этот класс реализуется вне данного стека.

### **ClassAncestorSensor** 
Базовый класс в представленной иерархии. Этот класс является отправной точкой для создания объектов конкретных датчиков и обеспечивает сбор и хранение информации о них. Его поля предоставляют основные характеристики, необходимые для идентификации и настройки датчика в рамках модуля ModuleSensorArchitecture. В первую очередь собирает в себе самые базовые данные о датчике: переданные параметры и описательную характеристику. Перечень полей см. ниже

### **Конструктор**
Конструктор принимает 1 объект типа **SensorPropsType** и 1 объект типа **SensorOptsType**.

Пример параметра *_sensor_props* типа **SensorPropsType**: 
```js
const _sensor_props = {
    name: "VL6180",                     //название датчика 
    type: "sensor",                     //тип
    channelNames: ['light', 'range'],   //именования каналов
    typeInSignal: "analog",             //тип входного сигнала
    typeOutSignal: "digital",           //тип выходного сигнала
    busTypes: ["i2c"],                  //типы подходящих шин
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
    bus: bus,           //объект шины
    pins: [B14, B15],   //массив используемых пинов 
}
```

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


### **Примеры**
**ClassAncestorSensor** применяется исключительно в роли родительского класса и не используется независимо. Потому наследники обязаны иметь такие же параметры конструктора, который ввиду особенностей среды выполнения Espruino вызывается таким образом:
```js
ClassAncestorSensor.apply(this, [_sensor_props, _opts]);
```

### **ClassMiddleSensor** 
Представляет собой ключевую составляющую рассматриваемой архитектуры классов. Смысл этого класса заключается в унификации работы с датчиками и их каналами, обеспечивая легкость и надежность взаимодействия прикладных разработчиков с датчиками в рамках фрейморка EcoLight. Наследуется от **ClassAncestorSensor**.
Реализует важнейшие принципы **ModuleSensorArchitecture**:
- Унификация хранения значений: **ClassMiddleSensor** организует хранение выходных значений с датчика в виде аксессоров (*Ch0_Value*, *Ch1_Value* и тд.), которые ссылаются на кольцевой буффер, созданный под каждый канал. Это обеспечивает единый интерфейс для работы с различными датчиками и их каналами.
- Обработка данных через аксессоры: Упомянутые выше аксессоры служат единой прослойкой, через которую проходят данные, позволяя применять ограничительные функции, корректировочную линейную функцию, фильтрацию и проверку на нахождение в заданных зонах измерения. Это обеспечивает надежную и легко расширяемую обработку данных с датчика.
- Автоматическое создание каналов: При инициализации "реального" датчика класс **ClassMiddleSensor** автоматически создает объекты-каналы (см.параграф **ClassChannel**), которые композируются в поле этого класса. Это упрощает создание и управление каналами датчика.
- Определение сигнатур методов: Класс **ClassMiddleSensor** определяет сигнатуры основных методов, которые будут доступны для работы с "реальными" датчиками и их каналами. Это обеспечивает единый интерфейс для инициализации, запуска, настройки и управления датчиками.

### **Поля**
- <mark style="background-color: lightblue">_Values</mark> - массив с объектами, реализующими кольцевой буффер;
- <mark style="background-color: lightblue">_Channels</mark> - массив с автоматически инстанцирующимися объектами ClassChannel;
- <mark style="background-color: lightblue">_IsChUsed</mark> - массив булевых значений, в котором i-й элемент указывает запущен ли в данный момент опрос i-го канала.

### **Аксессоры**
- <mark style="background-color: lightblue">Ch*N*_Value</mark> - геттер/сеттер в который **необходимо** записывать необработанные выходные значения с датчика и него же необходимо их считывать. В этом сеттере "сырое" значение автоматически проходит через все этапы обработки, включая фильтр;
- <mark style="background-color: lightblue">CountChannels</mark> - геттер, возвращающий количество корректно инициализированных каналов типа **ClassChannel**.

### **Методы**
- <mark style="background-color: lightblue">InitСhannels(_sensor_props)</mark> - метод обязывающий провести инициализацию датчика настройкой необходимых для его работы регистров;
- <mark style="background-color: lightblue">GetChannel(_ch_num)</mark> - метод возвращающий объект i-го канала;
- <mark style="background-color: lightblue">SetFilterDepth(_ch_num, _depth)</mark> - Метод который устанавливает глубину фильтруемых значений - изменяет количество значений, хранящихся в кольцевом буффере (_Values[i]) в момент времени; 
- <mark style="background-color: lightblue">Init(_opts)</mark> -Метод обязывающий провести инициализацию датчика настройкой необходимых для его работы регистров;
- <mark style="background-color: lightblue">Start(_ch_num, [_period], [_opts])</mark> - Метод обязывает запустить циклический опрос определенного канала датчика с заданной периодичностью в мс. Переданное значение периода должно сверяться с минимальным значением для данного канала и, если требуется, регулироваться, так как максимальная частота опроса зависит от характеристик датичка. 
В некоторых датчиках считывание значений с нескольких каналов происходит неразрывно и одновременно. В таких случаях ведется только один циклический опрос, а повторный вызов метода Start() для конкретного канала лишь определяет, будет ли в процессе опроса обновляться значение данного канала;
- <mark style="background-color: lightblue">Stop(_ch_num)</mark> - Метод обязывает прекратить считывание значений с заданного канала. В случаях, когда значения данного канала считываются синхронно с другими, достаточно прекратить обновление данных;
- <mark style="background-color: lightblue">ChangeFreq(_ch_num, _period)</mark> - Метод обязывает останавливить опрос указанного канала и запустить его вновь с уже новой частотой. Возобновиться должно обновление всех каналов, которые опрашивались перед остановкой;
- <mark style="background-color: lightblue">ConfigureRegs(_opts)</mark> - Метод обязывающий выполнить дополнительную конфигурацию датчика. Это может быть настройка пина прерывания, периодов измерения и прочих шагов, которые в общем случае необходимы для работы датчика, но могут переопределяться в процессе работы, и потому вынесены из метода Init();
- <mark style="background-color: lightblue">Reset()</mark> - Метод обязывающий выполнить перезагрузку датчика;
- <mark style="background-color: lightblue">SetRepeatability(_rep)</mark> - Метод обязывающий устанавливающий значение повторяемости
- <mark style="background-color: lightblue">SetPrecision(_pres)</mark> - Метод обязывающий устанавливающий точность измерений;
- <mark style="background-color: lightblue">Run(_ch_num, [_opts])</mark> - Метод который обязывает запустить прикладную работу датчика, сперва выполнив его полную инициализацию, конфигурацию и прочие необходимые процедуры, обеспечив его безопасный и корректный запуск;
- <mark style="background-color: lightblue">Read(_reg)</mark> - Метод обязывающий реализовать чтение с регистра;
- <mark style="background-color: lightblue">Write(_reg, _val)</mark> - Метод обязывающий реализовать запись в регистр.

### **ClassChannel** 
Класс, представляющий каждый отдельно взятый канал датчика. В парадигме фрейморка EcoLight именно через объект этого класса происходит прикладная работа с датчком. Является "синглтоном" для основного объекта датчика. Хранит в себе ссылки на основной объект сенсора и "проброшенные" методы для работы с данным каналом датчика, включая аксессоры. 
Также **ClassChannel** композирует в себе сервисные классы (см. **ClassDataRefine** и **ClassAlarms**) которые безусловно используются в аксессорах **ClassMiddleSensor** при обработке считываемых с датчика значений.

### **Поля**
- <mark style="background-color: lightblue">_ThisChannel</mark> - ссылка на основной объект датчика;
- <mark style="background-color: lightblue">_NumChannel</mark> - номер канала;
- <mark style="background-color: lightblue">_DataRefine</mark> - объект класса ClassDataRefine;
- <mark style="background-color: lightblue">_Alarms</mark> - объект класса ClassAlarms;

### **Аксессоры**
- <mark style="background-color: lightblue">Value</mark> -  геттер который ссылается на аксессор Ch*N*_Value (N = this._NumChannel) основного объекта датичка. Сбор данных предусмотрен только через этот аксессор; 
- <mark style="background-color: lightblue">CountChannels</mark> - геттер, возвращающий количество корректно инициализированных каналов типа **ClassChannel**;
- <mark style="background-color: lightblue">ID</mark> - геттер, возвращающий идентификатор датичка (канала);
- <mark style="background-color: lightblue">IsUsed</mark> - возвращает *true* если канал уже опрашивается, иначе - false.


### **Методы**
- <mark style="background-color: lightblue">Start([_period], [_opts])</mark>
- <mark style="background-color: lightblue">Stop()</mark> 
- <mark style="background-color: lightblue">ChangeFreq(_period)</mark>
- <mark style="background-color: lightblue">Run([_opts])</mark>
- <mark style="background-color: lightblue">ConfigureRegs()</mark>

### **Примеры**
```js
let some_sensor = new SomeSensor(...);
let ch0 = some_sensor.GetChannel(0);
let ch1 = some_sensor.GetChannel(1);
ch0.Start();
...
```

### **ClassDataRefine** 
Назначение класса заключается в обеспечении математической обработки выходных значений с датчика. **ClassDataRefine** позволяет настроить для отдельно взятого канала:
- Функцию-фильтр;
- Ограничение выходных значений;
- Коеффициенты корректирующей линейной Функции.
Объект класса автоматически инициализируется в поле *_DataRefine* класса **ClassChannel**. Методы для преобразования данных вызываются также автоматически из аксессоров типа *Ch0_Value*

### **Поля**
- <mark style="background-color: lightblue">_Values</mark> - массив с используемыми коэффициентами;
- <mark style="background-color: lightblue">_FilterFunc</mark> - функция которая вызывается из ClassMiddleSensor и применяется для фильтрации значений;

### **Методы**
- <mark style="background-color: lightblue">SetFilterFunc(_func)</mark> - Метод устанавливает фильтрующую функцию для канала
- <mark style="background-color: lightblue">SetOutLim(_limLow, _limHigh)</mark> - Метод устанавливает значения ограничителей выходных значений.
- <mark style="background-color: lightblue">SupressOutValue(val)</mark>
- <mark style="background-color: lightblue">SetTransmissionOut(_k, _b)</mark> - Метод устанавливает коэффициенты k и b функции выходных значений канала
- <mark style="background-color: lightblue">CalibrateOutValue(val)</mark> - Метод возвращает значение, прошедшее через коэффициенты функции вых.значений

### **Примеры**
```js
ch0._DataRefine.SetFilterFunc(_filterFunc);
ch0._DataRefine.SetTransmissionOut(1.1, 5);
ch0._DataRefine.SupressOutValue(200, 5);
```

### **ClassAlarms** 
Класс реализует определение измерительных зон канала. 
Измерительные зоны представляют собой определенные диапазоны значений, в пределах которых измерительное оборудование, такое как датчики или сенсоры, выполняет измерения и считывает данные. В SCADA системах измерительные зоны часто используются для определения нормального и ненормального состояния системы, а также для установления граничных значений, в пределах которых параметры должны находиться.
Алармы представляют собой механизмы оповещения или предупреждения, которые срабатывают, когда измеренные значения выходят за пределы заданных. 

<img src="/res/ZONES.png" alt="Image not found">

### **Поля**
- <mark style="background-color: lightblue">_Zones</mark> - Массив со значениями границ, которые задают зоны измерения;
- <mark style="background-color: lightblue">_Callbacks</mark> - Массив с коллбэками к измерительным зонам;
- <mark style="background-color: lightblue">_CurrZone</mark> - строковое представление текущей зоны.

### **Методы**
- <mark style="background-color: lightblue">SetZones(opts)</mark> - Метод, который задает зоны измерения и их функции-обработчики
- <mark style="background-color: lightblue">CheckZone(opts)</mark> - Метод обновляет значение текущей зоны измерения по переданному значению и, если зона сменилась, вызывает её колбэк.

### **Примеры**
```js
ch0._Alarms.SetZones({         
    red: { 
        low: -100, 
        high: 100, 
        cbLow: () => { console.log('L_RED'); }, 
        cbHigh: () => { console.log('H_RED'); }
    },
    yellow: { 
        low: -50, 
        high: 50, 
        cbLow: () => { console.log('L_YELLOW'); }, 
        cbHigh: () => { console.log('H_YELLOW')} 
    },
    green: { 
        cb: (prevZone) => { console.log(`Left ${prevZone}, now GREEN zone`); } 
    }
});

```
</div>

    