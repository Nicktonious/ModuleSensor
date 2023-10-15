<div style = "font-family: 'Open Sans', sans-serif; font-size: 16px">

## ClassChannel

### Описание
<div style = "color: #555">

Класс, представляющий каждый отдельно взятый канал датчика. В парадигме фрейморка EcoLight именно через объект этого класса происходит прикладная работа с датчком. Является "синглтоном" для основного объекта датчика. Хранит в себе ссылки на основной объект сенсора и "проброшенные" методы для работы с данным каналом датчика, включая аксессоры. 
Также **ClassChannel** композирует в себе сервисные классы (см. **ClassDataRefine** и **ClassAlarms**) которые безусловно используются в аксессорах **ClassMiddleSensor** при обработке считываемых с датчика значений.
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
- <mark style="background-color: lightblue">ID</mark> - возвращает идентификатор датичка (канала);
- <mark style="background-color: lightblue">IsUsed</mark> - возвращает *true* если канал уже опрашивается, иначе - false.
</div>

### Методы
<div style = "color: #555">

- <mark style="background-color: lightblue">Start([_period], [_opts])</mark>
- <mark style="background-color: lightblue">Stop()</mark> 
- <mark style="background-color: lightblue">ChangeFreq(_period)</mark>
- <mark style="background-color: lightblue">Run([_opts])</mark>
- <mark style="background-color: lightblue">ConfigureRegs()</mark>

Более развернутое описание методов [ClassMiddleSensor]
</div>

</div>