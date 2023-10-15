<div style = "font-family: 'Open Sans', sans-serif; font-size: 16px">

# ClassDataRefine
<div style = "color: #555">
    <p align="center">
    <img src="./res/logo.png" width="400" title="hover text">
    </p>
</div>

### Описание
<div style = "color: #555">

Назначение класса заключается в обеспечении математической обработкисчитанных с датчика значений. **ClassDataRefine** позволяет настроить для отдельно взятого канала:
- Функцию-фильтр;
- Ограничение входных значений;
- Коэффициенты трансформирующей линейной Функции.
Объект класса автоматически инициализируется в поле *DataRefine* класса **ClassChannel**. Методы для преобразования данных вызываются также автоматически из аксессоров типа *Ch0_Value*.
</div>

### Поля
<div style = "color: #555">

- <mark style="background-color: lightblue">_Values</mark> - массив с используемыми коэффициентами;
- <mark style="background-color: lightblue">_FilterFunc</mark> - функция которая вызывается из ClassMiddleSensor и применяется для фильтрации значений. По умолчанию фильтр-функция по умолчанию возвращает усредненное значение;
</div>

### Методы
<div style = "color: #555">

- <mark style="background-color: lightblue">SetFilterFunc(_func)</mark> - устанавливает фильтрующую функцию для канала;
- <mark style="background-color: lightblue">SetOutLim(_limLow, _limHigh)</mark> - устанавливает значения ограничителей входных значений;
- <mark style="background-color: lightblue">SupressOutValue(val)</mark> - устанавливает значения ограничителей супрессорной функции;
- <mark style="background-color: lightblue">SetTransmissionOut(_k, _b)</mark> - устанавливает коэффициенты k и b трансформирующей функции канала;
- <mark style="background-color: lightblue">TransformOutValue(val)</mark> - возвращает значение, прошедшее через коэффициенты трансформирующей функции.

<div align='left'>
    <img src="./res/math.png" alt="Image not found">
</div>
</div>

### Обработка значений с датчика
<div style = "color: #555">

В рамках реализации модуля любого датичка, считанное с него значение сохраняется через аксессор *ChN_Value*. Там "сырое" значение проходит через линейное преобразование, супрессию и помещается в массив, который далее обрабатывает функция-фильтр. После этого этапа производится проверка зон измерения.
Итоговое значение доступно пользователю через аксессор *Value* класса **ClassChannelSensor**.

<div align='left'>
    <img src="./res/data_transformation.png" alt="Image not found">
</div>

</div>

</div>