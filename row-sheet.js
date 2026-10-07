// Numbers — scheda di riga.
// Toccando una riga di lista si apre una scheda con i dati della riga e le sue azioni.
// I bottoni veri restano nella riga, nascosti dal CSS: la scheda li preme, così ogni
// azione passa dai gestori che esistono già in index.html. Qui non c'è logica di dominio.
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else {
        root.RowSheet = api;
        if (root.document) api.install(root.document);
    }
})(typeof self !== 'undefined' ? self : this, function () {

    const TITLES = {
        invoicesTable: 'Fattura', customersTable: 'Cliente', expensesTable: 'Spesa',
        recurringTable: 'Spesa ricorrente', remindersTable: 'Scadenza', notesTable: 'Nota',
        expenseNotesTable: 'Rimborso', companiesTable: 'Azienda'
    };
    // La colonna che dà il nome alla riga, in ordine di apparizione.
    const MAIN_LABELS = ['cliente', 'descrizione', 'nome', 'titolo', 'nome azienda'];

    function clean(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }

    // Parte pura: decide cosa mostra la scheda.
    //   title   → nome della lista ('Fattura')
    //   headers → testi delle intestazioni, uno per colonna
    //   cells   → [{ text, isNum, isActions }], una per colonna
    //   actions → [{ label, danger }], nell'ordine dei bottoni della riga
    function buildModel(input) {
        input = input || {};
        const headers = input.headers || [];
        const rows = [];
        let amount = null, amountLabel = '';
        (input.cells || []).forEach((cell, i) => {
            if (!cell || cell.isActions) return;
            const text = clean(cell.text);
            if (!text) return;
            const label = clean(headers[i]);
            if (cell.isNum && amount === null) {
                amount = text;
                // «Importo» sopra un importo non dice niente; «Fatturato totale» sì.
                amountLabel = label.toLowerCase() === 'importo' ? '' : label;
                return;
            }
            if (label) rows.push({ label, value: text });
        });
        const main = rows.find(r => MAIN_LABELS.indexOf(r.label.toLowerCase()) !== -1) || rows[0];
        const actions = (input.actions || [])
            .map((a, index) => ({ label: clean(a && a.label), danger: !!(a && a.danger), index }))
            .filter(a => a.label)
            .sort((a, b) => (a.danger - b.danger) || (a.index - b.index));
        // La riga che fa da sottotitolo non si ripete tra i dati.
        return { title: clean(input.title), subtitle: main ? main.value : '', amount, amountLabel, rows: rows.filter(r => r !== main), actions };
    }

    function install(doc) {
        let backdrop = null, sheet = null, parts = null, lastRow = null;

        function el(tag, className, text) {
            const node = doc.createElement(tag);
            if (className) node.className = className;
            if (text != null) node.textContent = text;
            return node;
        }

        function build() {
            backdrop = el('div', 'row-sheet__backdrop');
            backdrop.hidden = true;
            sheet = el('div', 'row-sheet');
            sheet.setAttribute('role', 'dialog');
            sheet.setAttribute('aria-modal', 'true');
            sheet.setAttribute('aria-labelledby', 'rowSheetTitle');
            sheet.tabIndex = -1;
            const head = el('div', 'row-sheet__head');
            const titles = el('div', 'row-sheet__titles');
            parts = {
                title: el('div', 'row-sheet__title'),
                sub: el('div', 'row-sheet__sub'),
                amountLabel: el('div', 'row-sheet__amount-label'),
                amount: el('div', 'row-sheet__amount'),
                data: el('dl', 'row-sheet__data'),
                actions: el('div', 'row-sheet__actions')
            };
            parts.title.id = 'rowSheetTitle';
            const closeBtn = el('button', 'row-sheet__close', '\u00D7');
            closeBtn.type = 'button';
            closeBtn.setAttribute('aria-label', 'Chiudi');
            closeBtn.addEventListener('click', close);
            titles.append(parts.title, parts.sub);
            head.append(titles, closeBtn);
            sheet.append(el('div', 'row-sheet__grab'), head, parts.amountLabel, parts.amount, parts.data, parts.actions);
            backdrop.append(sheet);
            backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });
            doc.body.append(backdrop);
        }

        function headerText(th) {
            const copy = th.cloneNode(true);
            copy.querySelectorAll('.sort-caret').forEach(n => n.remove());
            return copy.textContent;
        }

        // Testo della cella: via i controlli interni (ma non i collegamenti, che sono il titolo
        // di scadenze e note), bollini e note staccati dal testo con un punto.
        function cellText(td) {
            const copy = td.cloneNode(true);
            copy.querySelectorAll('button, [onclick]:not(a)').forEach(n => n.remove());
            copy.querySelectorAll('.badge, small').forEach(n => n.before(' \u00B7 '));
            copy.querySelectorAll('br').forEach(n => n.replaceWith(' '));
            return copy.textContent.replace(/^\s*\u00B7\s*/, '');
        }

        function open(row, table) {
            const buttons = Array.from(row.querySelectorAll('td.action-btns button'));
            if (!buttons.length) return;
            // In scadenze e note la modifica sta sul titolo, che è un collegamento: nella scheda
            // diventa la voce «Modifica», così le azioni della riga sono tutte nello stesso posto.
            const editLink = row.querySelector('td:not(.action-btns) a[onclick]');
            const targets = editLink ? buttons.concat(editLink) : buttons;
            if (!backdrop) build();
            const ths = table.tHead && table.tHead.rows[0] ? Array.from(table.tHead.rows[0].cells) : [];
            const model = buildModel({
                title: TITLES[table.id],
                headers: ths.map(headerText),
                cells: Array.from(row.cells).map(td => ({
                    text: td.classList.contains('action-btns') ? '' : cellText(td),
                    isNum: td.classList.contains('num'),
                    isActions: td.classList.contains('action-btns')
                })),
                actions: targets.map(t => ({ label: t === editLink ? 'Modifica' : t.textContent, danger: t.classList.contains('btn-danger') }))
            });

            sheet.dataset.table = table.id;   // per lo stile: l'importo di una fattura è verde
            parts.title.textContent = model.title;
            parts.sub.textContent = model.subtitle;
            parts.amountLabel.textContent = model.amount ? model.amountLabel : '';
            parts.amount.textContent = model.amount || '';
            parts.data.replaceChildren(...model.rows.map(r => {
                const line = el('div', 'row-sheet__row');
                line.append(el('dt', '', r.label), el('dd', '', r.value));
                return line;
            }));
            parts.actions.replaceChildren(...model.actions.map(a => {
                const btn = el('button', 'row-sheet__action' + (a.danger ? ' row-sheet__action--danger' : ''), a.label);
                btn.type = 'button';
                btn.addEventListener('click', () => {
                    const target = targets[a.index];
                    close();
                    if (target && target.isConnected) target.click();
                });
                return btn;
            }));

            lastRow = row;
            backdrop.hidden = false;
            sheet.scrollTop = 0;
            sheet.focus();
        }

        function close() {
            if (!backdrop || backdrop.hidden) return;
            backdrop.hidden = true;
            if (lastRow && lastRow.isConnected) lastRow.focus({ preventScroll: true });
            lastRow = null;
        }

        function rowFromEvent(e) {
            const row = e.target.closest && e.target.closest('tbody tr');
            if (!row) return null;
            const table = row.closest('table');
            if (!table || !TITLES[table.id]) return null;
            return { row, table };
        }

        doc.addEventListener('click', e => {
            const hit = rowFromEvent(e);
            if (!hit) return;
            // Un collegamento o un controllo dentro la riga fa quello che fa già.
            if (e.target.closest('a, button, input, select, textarea, label, [onclick]')) return;
            open(hit.row, hit.table);
        });

        doc.addEventListener('keydown', e => {
            if (e.key === 'Escape' && backdrop && !backdrop.hidden) {
                e.stopImmediatePropagation();
                close();
                return;
            }
            if (e.key === 'Enter' && e.target.matches && e.target.matches('tbody tr')) {
                const hit = rowFromEvent(e);
                if (hit) { e.preventDefault(); open(hit.row, hit.table); }
            }
        }, true);

        // Le righe vengono ridisegnate a ogni caricamento: ognuna deve poter prendere il fuoco.
        function mark(tbody) {
            Array.from(tbody.rows).forEach(r => {
                if (r.querySelector('td.action-btns') && !r.hasAttribute('tabindex')) r.setAttribute('tabindex', '0');
            });
        }
        Object.keys(TITLES).forEach(id => {
            const table = doc.getElementById(id);
            const tbody = table && table.tBodies[0];
            if (!tbody) return;
            mark(tbody);
            new MutationObserver(() => mark(tbody)).observe(tbody, { childList: true });
        });

        return { open, close };
    }

    return { buildModel, install, TITLES };
});
