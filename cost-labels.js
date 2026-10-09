// Numbers — conto e tipo delle spese.
// Funzioni pure che decidono cosa scrivere accanto a una spesa o a una regola:
// «Fisso», «Variabile», «Variabile · da confermare», e l'elenco dei conti già usati.
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.CostLabels = api;
})(typeof self !== 'undefined' ? self : this, function () {

    function clean(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }

    // Postgres può restituire i booleani come 't'/'f'. Manca = confermata (voci di prima).
    function isFalse(v) { return v === false || v === 'f' || v === 'false' || v === 0 || v === '0'; }

    function ruleType(rule) {
        return rule && rule.cost_type === 'variable' ? 'variable' : 'fixed';
    }

    function ruleTypeLabel(rule) {
        return ruleType(rule) === 'variable' ? 'Variabile · stima' : 'Fisso';
    }

    // Il bollino accanto alla descrizione di una spesa. null = spesa segnata a mano.
    //   tone 'pending' → ambra (c'è qualcosa da fare), 'auto' → grigio
    function expenseBadge(expense) {
        const source = expense && expense.auto_source;
        if (!source) return null;
        if (String(source).indexOf('rule:') !== 0) {
            return { text: 'Auto', tone: 'auto', title: expense.notes || 'Si aggiorna da sola' };
        }
        if (expense.cost_type === 'variable') {
            return isFalse(expense.amount_confirmed)
                ? { text: 'Variabile · da confermare', tone: 'pending', title: 'Importo stimato: aprila e metti la cifra della fattura' }
                : { text: 'Variabile', tone: 'auto', title: 'Costo variabile, cifra confermata' };
        }
        if (expense.cost_type === 'fixed') return { text: 'Fisso', tone: 'auto', title: 'Costo fisso ricorrente' };
        return { text: 'Ricorrente', tone: 'auto', title: expense.notes || 'Si aggiorna da sola' };
    }

    // I conti già scritti in regole e spese, per riproporli nei moduli. Stesso conto scritto
    // con maiuscole diverse conta una volta sola (vince la prima grafia incontrata).
    function knownAccounts(rules, expenses) {
        const seen = new Map();
        [].concat(rules || [], expenses || []).forEach(item => {
            const name = clean(item && item.account);
            if (name && !seen.has(name.toLowerCase())) seen.set(name.toLowerCase(), name);
        });
        return Array.from(seen.values()).sort((a, b) => a.localeCompare(b, 'it', { sensitivity: 'base' }));
    }

    return { ruleType, ruleTypeLabel, expenseBadge, knownAccounts };
});
