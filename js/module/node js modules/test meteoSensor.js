/**
 * @class
 * Класс ClassSHT31 р
 */
class ClassSHT31 extends ClassMiddleSensor {
    /**
     * @constructor
     * @param {Pin} _scl   - Пин для I2C.AddBus()
     * @param {Pin} _sda   - Пин для I2C.AddBus()
     */
    constructor(_sensor_props, _bus, _address, _rep) {
        ClassMiddleSensor.apply(this, [_sensor_props]);
        this._name = 'ClassSHT31'; //переопределяем имя типа
        this._usedChannels = [];
    }
    Init(_bus, _address) {
        this._sensor = require('https://raw.githubusercontent.com/AlexGlgr/ModuleMeteoSHT31/fork-Alexander/js/module/BaseClassSHT31.min.js').connect({i2c: I2C.AddBus(_scl, _sda)});
        this._heaterOn = false;
        this._minPeriod = 5000;
    }
    /**
     * @method
     * Настривает повторяемость
     * @param {string}  value - повторяемость
     */
    Configure(value) {
        switch (value) {
            case "HIGH":
                this._sensor.setRepeatability('HIGH'); 
                break;
            case "MEDIUM":
                this._sensor.setRepeatability('MEDIUM'); 
                break;
            default:
                this._sensor.setRepeatability('LOW'); 
                break;
        }
    }
    /**
     * @method
     * Включает/выключает нагреватель
     * @returns {boolean}  - нагреватель включен или выключен
     */
    SwitchHeater() {
        if (this._heaterOn) {
            this._sensor.heaterOff();
            this._heaterOn = false;
        }
        else {
            this._sensor.heaterOn();
            this._heaterOn = true;
        }

        return this._heaterOn;
    }
    /**
     * @method
     * Сбрасывает датчик
     * @returns {string}  - подтверждение, что датчик сброшен
     */
    Reset() {
        this._sensor.reset();

        return "Sensor reset";
    }

    Start(_period, _num_channel) {
        let period = (typeof _period === 'number' & _period >= this._minPeriod) ? _period    //частота сверяется с минимальной
                 : this._minPeriod;

        if (!this._usedChannels.includes(_num_channel)) this._usedChannels.push(_num_channel); //номер канала попадает в список опрашиваемых каналов. Если интервал уже запущен с таким же периодои, то даже нет нужды его перезапускать 
        if (!this._interval) {          //если в данный момент не ведется ни одного опроса
            this.SwitchHeater();
            this._interval = setInterval(() => {
            this._sensor.read(d => {
                if (this._usedChannels.includes(0)) this.Ch0_Value = d.temp;
                if (this._usedChannels.includes(1)) this.Ch1_Value = d.humidity;
            });
            }, period);
        }
        else if (period !== this._currentPeriod) {    //если юзер хочет установить другую периодичность
            this.Stop();
            setTimeout(() => {
                this.Start(_num_channel, period);
            }, this._minPeriod);
        }        
        this._currentPeriod = period;
    }

    Stop(_num_channel) {
        if (_num_channel) this._usedChannels.splice(this._usedChannels.indexOf(_num_channel));
        else {
            this._usedChannels = [];
            clearInterval(this._interval);
            this._interval = null;
        }
    }

    Run(_num_channel) {
        this.Init();
        this.Configure('LOW');
        this.SwitchHeater();
        this.Start()
    }

    // TODO: Метод СТАРТ, который вызывает все остальные методы и устанавливает интервал их вызова
    // TODO: Метод для изменения частоты опроса
    // TODO: Метод СТОП
    /*
    meteoSensor.read(function(err, data) {
    if (err) {
        print(err);
    } else {
        print("Temp is: "+data.tempC+" C," + "Temp is: "+data.tempF+" F,"+
        "Temp is: "+data.tempK+" K,"+"Hum is: "+data.humidity+" %");
    }
    });
    */
}
	

exports = ClassSHT31;