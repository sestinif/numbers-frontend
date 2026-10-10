// Numbers — il periodo che si sta guardando.
// Un periodo solo per tutta l'app: un mese, un anno, oppure tutto. Qui ci sono solo
// funzioni pure: dire se una data cade nel periodo, spostarlo con le frecce, dargli un nome.
// Chi disegna il selettore e chi ricarica le pagine sta in index.html.
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.Period = api;
})(typeof self !== 'undefined' ? self : this, function () {

    const MONTHS = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    const MODES = ['M', 'A', 'T']; // mese, anno, tutto
    const STORAGE_KEY = 'numbers.periodMode';

    // month va da 1 a 12.
    function current(now) {
        const d = now || new Date();
        return { mode: 'M', year: d.getFullYear(), month: d.getMonth() + 1 };
    }

    function label(period) {
        if (period.mode === 'T') return 'Tutto';
        if (period.mode === 'A') return String(period.year);
        return MONTHS[period.month - 1] + ' ' + period.year;
    }

    // La data si legge come la legge il resto dell'app (new Date + ora locale), così il
    // filtro e la data scritta nella riga dicono sempre lo stesso mese.
    function contains(period, value) {
        if (period.mode === 'T') return true;
        if (value == null || value === '') return false;
        const d = value instanceof Date ? value : new Date(value);
        if (isNaN(d.getTime())) return false;
        if (d.getFullYear() !== period.year) return false;
        return period.mode === 'A' ? true : d.getMonth() + 1 === period.month;
    }

    function filter(list, getDate, period) {
        if (period.mode === 'T') return list.slice();
        return list.filter(item => contains(period, getDate(item)));
    }

    function shift(period, step, now) {
        if (period.mode === 'T') return current(now);
        if (period.mode === 'A') return { mode: 'A', year: period.year + step, month: period.month };
        const index = period.year * 12 + (period.month - 1) + step;
        return { mode: 'M', year: Math.floor(index / 12), month: (index % 12 + 12) % 12 + 1 };
    }

    function withMode(period, mode) {
        if (!MODES.includes(mode)) return period;
        return { mode, year: period.year, month: period.month };
    }

    // Il periodo con cui confrontare: mese prima, anno prima. Con «Tutto» non c'è.
    function previous(period) {
        if (period.mode === 'T') return null;
        return shift(period, -1);
    }

    function previousLabel(period) {
        const prev = previous(period);
        if (!prev) return '';
        return prev.mode === 'A' ? String(prev.year) : MONTHS[prev.month - 1].toLowerCase();
    }

    // Vero se il periodo finisce prima del mese 'YYYY-MM': un mese precedente, o un anno
    // intero precedente. «Tutto» arriva fino a oggi, quindi mai.
    function endsBefore(period, yearMonth) {
        if (period.mode === 'T') return false;
        const month = period.mode === 'A' ? 12 : period.month;
        return period.year + '-' + String(month).padStart(2, '0') < yearMonth;
    }

    // 'YYYY-MM' scritto per esteso, in minuscolo: «ottobre 2026».
    function monthLabel(yearMonth) {
        const [y, m] = yearMonth.split('-').map(Number);
        return MONTHS[m - 1].toLowerCase() + ' ' + y;
    }

    // Si ricorda solo la vista (mese, anno, tutto). Mese e anno ripartono da oggi:
    // riaprire l'app su un mese scelto la settimana scorsa confonderebbe.
    function load(storage, now) {
        const base = current(now);
        try {
            const mode = storage && storage.getItem(STORAGE_KEY);
            return MODES.includes(mode) ? withMode(base, mode) : base;
        } catch (e) {
            return base;
        }
    }

    function save(storage, period) {
        try { if (storage) storage.setItem(STORAGE_KEY, period.mode); } catch (e) { /* memoria bloccata: pazienza */ }
    }

    return { current, label, contains, filter, shift, withMode, previous, previousLabel, endsBefore, monthLabel, load, save, MONTHS };
});
