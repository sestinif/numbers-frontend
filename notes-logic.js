// Numbers — logica delle Note.
// Funzioni pure: niente DOM, niente rete, niente orologio se non glielo passi.
// Le date sono sempre stringhe 'YYYY-MM-DD': il driver pg converte una colonna DATE
// in un Date a mezzanotte locale, che serializzato in UTC può risultare il giorno prima.
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.NotesLogic = api;
})(typeof self !== 'undefined' ? self : this, function () {

    function pad(n) { return String(n).padStart(2, '0'); }

    // Normalizza a 'YYYY-MM-DD'. Accetta stringhe ISO, date pure e oggetti Date.
    function toISODate(value) {
        if (!value) return '';
        if (value instanceof Date) {
            if (isNaN(value.getTime())) return '';
            return value.getFullYear() + '-' + pad(value.getMonth() + 1) + '-' + pad(value.getDate());
        }
        const s = String(value);
        const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
        return m ? m[0] : '';
    }

    function todayISO(date) {
        return toISODate(date instanceof Date ? date : new Date());
    }

    // Date.UTC ignora fusi e ora legale: due mezzanotti UTC distano sempre 24h esatte.
    function toUTC(iso) {
        const s = toISODate(iso);
        if (!s) return NaN;
        return Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
    }

    function daysBetween(fromISO, toISOValue) {
        const a = toUTC(fromISO), b = toUTC(toISOValue);
        if (isNaN(a) || isNaN(b)) return 0;
        return Math.round((b - a) / 86400000);
    }

    function tomorrowISO(todayIso) {
        const t = toUTC(todayIso);
        if (isNaN(t)) return '';
        return toISODate(new Date(t + 86400000).toISOString());
    }

    // Postgres può restituire i booleani come 't'/'f'. Normalizziamo.
    function isTrue(v) {
        return v === true || v === 't' || v === 'true' || v === 1 || v === '1';
    }

    // Nel popup finisce una nota non chiusa, arrivata a scadenza, e non rinviata a domani.
    function selectNotesForAlert(notes, todayIso) {
        if (!Array.isArray(notes)) return [];
        const today = toISODate(todayIso);
        return notes
            .filter(n => {
                if (isTrue(n.done)) return false;
                const due = toISODate(n.due_date);
                if (!due || due > today) return false;
                const snooze = toISODate(n.snoozed_until);
                return !snooze || snooze <= today;
            })
            .sort((a, b) => toISODate(a.due_date).localeCompare(toISODate(b.due_date)));
    }

    // Il badge ignora il rinvio: zittisce il popup, non il pallino rosso.
    function countBadgeNotes(notes, todayIso) {
        if (!Array.isArray(notes)) return 0;
        const today = toISODate(todayIso);
        return notes.filter(n => {
            if (isTrue(n.done)) return false;
            const due = toISODate(n.due_date);
            return due && due <= today;
        }).length;
    }

    function formatDueLabel(dueIso, todayIso) {
        const d = daysBetween(dueIso, todayIso); // giorni passati dalla scadenza
        if (d === 0) return 'oggi';
        if (d === 1) return 'scaduta 1 giorno fa';
        if (d > 1) return 'scaduta ' + d + ' giorni fa';
        if (d === -1) return 'domani';
        return 'fra ' + (-d) + ' giorni';
    }

    return {
        toISODate, todayISO, daysBetween, tomorrowISO,
        selectNotesForAlert, countBadgeNotes, formatDueLabel
    };
});
