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

- <mark style="background-color: lightblue">_ThisChannel</mark> - ссылка на основной объект датчика;
- <mark style="background-color: lightblue">_NumChannel</mark> - номер канала;
- <mark style="background-color: lightblue">_DataRefine</mark> - объект класса ClassDataRefine;
- <mark style="background-color: lightblue">_Alarms</mark> - объект класса ClassAlarms;
</div>

### Аксессоры
<div style = "color: #555">

- <mark style="background-color: lightblue">Value</mark> - ссылается на аксессор Ch*N*_Value (N = this._NumChannel) основного объекта датичка. Сбор данных предусмотрен только через этот аксессор; 
- <mark style="background-color: lightblue">CountChannels</mark> - возвращает количество корректно инициализированных каналов типа **ClassChannel**;
- <mark style="background-color: lightblue">ID</mark> - возвращает идентификатор датчика (канала);
- <mark style="background-color: lightblue">IsUsed</mark> - возвращает *true* если канал уже опрашивается, иначе - false.
</div>

### Методы
<div style = "color: #555">

- <mark style="background-color: lightblue">Start([_period], [_opts])</mark>
- <mark style="background-color: lightblue">Stop()</mark> 
- <mark style="background-color: lightblue">ChangeFreq(_period)</mark>
- <mark style="background-color: lightblue">Run([_opts])</mark>
- <mark style="background-color: lightblue">ConfigureRegs()</mark>

Данные методы ссылаются на методы, объявленные в **ClassMiddleSensor** и реализованные в прикладном классе датичка. Их развернутое описание [по ссылке](./README_MIDDLE.md#методы).
</div>

### Зависимости
<div style = "color: #555">

- <mark style="background-color: lightblue">[ClassAppError](https://github.com/Konkery/ModuleAppError/blob/main/README.md)</mark>
</div>

</div>