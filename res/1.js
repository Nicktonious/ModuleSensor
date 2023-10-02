const indexes = { redLow: 0, yelLow: 1, green: 2, yelHigh: 3, redHigh: 4 };
class Alarms {
    constructor() {
        this._Zones = [];
        this._Callbacks = [];
        this._Callbacks[indexes.green] = () => { };
        this._CurrZone = '';
    }
    /**
     * @param {Object} opts 
     */
    SetZones(opts) {
        const checkParams = {   // объект в котором каждой задаваемой зоне соответсвует функция, которая возвращает true если параметры, зад зоны валидны
            green: () => (typeof opts.green.cb === 'function'),
            yellow: () => (opts.yellow.low < opts.yellow.high),
            red: () => (opts.red.low < opts.red.high)
        };
        ['red', 'yellow', 'green'].filter(zoneName => opts[zoneName]).forEach(zoneName => {
            if (!checkParams[zoneName]()) throw new Error();
        });

        if (opts.yellow) {
            if (opts.red) {
                if (opts.yellow.low <= opts.red.low || opts.yellow.high >= opts.red.high) throw new Error();
            }
            else if (opts.yellow.low <= this._Zones[indexes.redLow] || opts.yellow.high >= this._Zones[indexes.redHigh]) throw new Error();
            this._Zones[indexes.yelLow] = opts.yellow.low;
            this._Zones[indexes.yelHigh] = opts.yellow.high;
            this._Callbacks[indexes.yelLow] = opts.yellow.cbLow;
            this._Callbacks[indexes.yelHigh] = opts.yellow.cbHigh;
        }
        if (opts.red) {
            if (opts.yellow) {
                if (opts.red.low >= opts.yellow.low || opts.red.high <= opts.yellow.high) throw new Error();
            }
            else if (opts.red.low >= this._Zones[indexes.yelLow] || opts.red.high <= this._Zones[indexes.yelHigh]) throw new Error();
            this._Zones[indexes.redLow] = opts.red.low;
            this._Zones[indexes.redHigh] = opts.red.high;
            this._Callbacks[indexes.redLow] = opts.red.cbLow;
            this._Callbacks[indexes.redHigh] = opts.red.cbHigh;
        }
        if (opts.green) {
            this._Callbacks[indexes.green] = opts.green.cb;
        }
    }

    CheckZone(val) {
        let prevZone = this._CurrZone;
        this._CurrZone = val < this._Zones[indexes.redLow]  ? 'redLow'
                       : val > this._Zones[indexes.redHigh] ? 'redHigh'
                       : val < this._Zones[indexes.yelLow]  ? 'yelLow'
                       : val > this._Zones[indexes.yelHigh] ? 'yelHigh'
                       : 'green';

        if (prevZone !== this._CurrZone) {
            this._Callbacks[indexes[this._CurrZone]](prevZone);
        }
    }
}
const a = new Alarms();


a.SetZones({
    red: { low: -100, high: 100, cbLow: () => { console.log('LRED'); }, cbHigh: () => { console.log('HRED'); } },
    yellow: { low: -50, high: 50, cbLow: () => { console.log('LYELL'); }, cbHigh: () => { console.log('HYELL');}},
    green: { cb: (prev) => {console.log(`now GREEN, previous ${prev}`); }}
});

a.SetZones({
    red: { low: -120, high: 120, cbLow: () => { console.log('new LRED'); }, cbHigh: () => { console.log('new HRED');} },
    yellow: { low: -110, high: 110, cbLow: () => { console.log('new LY'); }, cbHigh: () => { console.log('new HY');} }
});

a.SetZones({
    red: { low: -100, high: 100, cbLow: () => { console.log('LRED'); }, cbHigh: () => { console.log('HRED'); } },
    yellow: { low: -50, high: 50, cbLow: () => { console.log('LYELL'); }, cbHigh: () => { console.log('HYELL');}},
    green: { cb: (prev) => {console.log(`now GREEN, previous ${prev}`); }}
});

