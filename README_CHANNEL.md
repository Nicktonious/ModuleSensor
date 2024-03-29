<div style = "font-family: 'Open Sans', sans-serif; font-size: 16px">

# ClassChannel
<div style = "color: #555">
    <p align="center">
    <img src="./res/logo.png" width="400" title="hover text">
    </p>
</div>

### Описание
<div style = "color: #555">

Компонент [ModuleSensor](./README_MIDDLE.md), который представляет каждый отдельно взятый канал датчика. В парадигме фрейморка EcoLight именно через объект этого класса происходит прикладная работа с датчиком. Является "синглтоном" для основного объекта датчика. Хранит в себе ссылки на основной объект сенсора и "проброшенные" методы для работы с данным каналом датчика, включая аксессоры. 
Также данный класс композирует в себе сервисные классы (см. [ClassDataRefine](./README_DATA_REFINE.md) и [ClassAlarms](./README_ALARMS.md)), которые безусловно используются в [аксессорах](./README_MIDDLE.md#аксессоры) ClassMiddleSensor при обработке считываемых с датчика значений.
</div>

### Поля
<div style = "color: #555">

- <mark style="background-color: lightblue">_Value</mark> - поле, в которое сохраняется последнее считанное значение *Value*;
- <mark style="background-color: lightblue">_DataUpdated</mark> - флаг указывающий на то что закэшированное значение *_Value* уже не является актуальным;
- <mark style="background-color: lightblue">_DataWasRead</mark> - флаг указывающий на то что последнее актуальное значение *Value* уже было считано и сохранено;
- <mark style="background-color: lightblue">_ThisChannel</mark> - ссылка на основной объект датчика;
- <mark style="background-color: lightblue">_NumChannel</mark> - номер канала;
- <mark style="background-color: lightblue">_DataRefine</mark> - объект класса ClassDataRefine;
- <mark style="background-color: lightblue">_Alarms</mark> - объект класса ClassAlarms;
</div>

### Аксессоры
<div style = "color: #555">

- <mark style="background-color: lightblue">Value</mark> - возвращает показание с измерительного канала датчика, прошедшее через все этапы математической обработки. Сбор данных предусмотрен только через этот аксессор; 
- <mark style="background-color: lightblue">_ValueBuffer</mark> - буффера фиксированной длины, в котором сохраняются необработанные показания датчика;
- <mark style="background-color: lightblue">CountChannels</mark> - возвращает количество корректно инициализированных каналов типа **ClassChannel**;
- <mark style="background-color: lightblue">ID</mark> - возвращает идентификатор датчика (канала);
- <mark style="background-color: lightblue">DataRefine</mark> - возвращает объект *_DataRefine*;
- <mark style="background-color: lightblue">Alarms</mark> - возвращает объект *_Alarms* после его инициализации;
- <mark style="background-color: lightblue">Status</mark> - возвращает текущий статус датчика (канала) в виде числового кода. 
    - 0 - канал не активен;
    - 1 - канал в работе;
    - 2 - датчик в переходном процессе

</div>

### Методы
<div style = "color: #555">

- <mark style="background-color: lightblue">SetFilterDepth(_depth)</mark> - устанавливает размер буффера, в котором хранятся сырые показания датчика;
- <mark style="background-color: lightblue">AddRawValue(val)</mark> - добавляет значение в буффер;
- <mark style="background-color: lightblue">EnableAlarms(val)</mark> - создает объект *_Alarms*;
- <mark style="background-color: lightblue">SetFilterDepth(_depth)</mark> - устанавливает размер буффера, в котором хранятся сырые показания датчика;
- <mark style="background-color: lightblue">Start([_period], [_opts])</mark>
- <mark style="background-color: lightblue">Stop()</mark> 
- <mark style="background-color: lightblue">ChangeFreq(_period)</mark>
- <mark style="background-color: lightblue">Run([_opts])</mark>
- <mark style="background-color: lightblue">Configure()</mark>

Некоторые из этих методов ссылаются на соответствующий функционал, объявленный в **ClassMiddleSensor** и реализованный в прикладном классе датчика. Развернутое описание данных методов [по ссылке](./README_MIDDLE.md#методы).
</div>

### Зависимости
<div style = "color: #555">

</div>

</div>