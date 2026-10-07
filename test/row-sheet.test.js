const test = require('node:test');
const assert = require('node:assert');
const R = require('../row-sheet.js');

const fattura = {
    title: 'Fattura',
    headers: ['N.', 'Data', 'Cliente', 'Importo', ''],
    cells: [
        { text: '34' }, { text: '03/10/2026' }, { text: ' Aurora Academy SRL\n' },
        { text: '€4.200,00', isNum: true }, { text: 'Visualizza PDF Duplica Modifica Elimina', isActions: true }
    ],
    actions: [
        { label: 'Visualizza' }, { label: 'PDF' }, { label: 'Duplica' },
        { label: 'Modifica' }, { label: 'Elimina', danger: true }
    ]
};

test('la fattura mostra importo, dati e azioni', () => {
    const m = R.buildModel(fattura);
    assert.strictEqual(m.title, 'Fattura');
    assert.strictEqual(m.subtitle, 'Aurora Academy SRL');
    assert.strictEqual(m.amount, '€4.200,00');
    // Il cliente fa da sottotitolo: non si ripete tra i dati.
    assert.deepStrictEqual(m.rows, [
        { label: 'N.', value: '34' },
        { label: 'Data', value: '03/10/2026' }
    ]);
    assert.deepStrictEqual(m.actions.map(a => a.label), ['Visualizza', 'PDF', 'Duplica', 'Modifica', 'Elimina']);
});

test('ogni azione ricorda la posizione del suo bottone', () => {
    const m = R.buildModel({ title: 'Nota', headers: ['Titolo', ''], cells: [{ text: 'X' }, { isActions: true }],
        actions: [{ label: 'Elimina', danger: true }, { label: 'Fatto' }] });
    assert.deepStrictEqual(m.actions, [
        { label: 'Fatto', danger: false, index: 1 },
        { label: 'Elimina', danger: true, index: 0 }
    ]);
});

test('una riga senza importo non ha la cifra grande', () => {
    const m = R.buildModel({ title: 'Scadenza', headers: ['Descrizione', 'Scadenza', 'Ricorrenza', 'Stato', ''],
        cells: [{ text: 'Dichiarazione IVA' }, { text: '16/10/2026' }, { text: 'Mensile' }, { text: 'In attesa' }, { isActions: true }],
        actions: [{ label: 'Fatto' }] });
    assert.strictEqual(m.amount, null);
    assert.strictEqual(m.subtitle, 'Dichiarazione IVA');
    assert.deepStrictEqual(m.rows.map(r => r.label), ['Scadenza', 'Ricorrenza', 'Stato']);
});

test('il sottotitolo è la descrizione anche se il cliente viene dopo', () => {
    const m = R.buildModel({ title: 'Rimborso', headers: ['Data', 'Descrizione', 'Cliente', 'Importo', 'Stato', ''],
        cells: [{ text: '03/10/2026' }, { text: 'Volo Malta-Bologna' }, { text: 'Aurora Academy SRL' }, { text: '€184,30', isNum: true }, { text: 'In sospeso' }, { isActions: true }],
        actions: [] });
    assert.strictEqual(m.subtitle, 'Volo Malta-Bologna');
});

test('celle vuote e intestazioni vuote non diventano righe', () => {
    const m = R.buildModel({ title: 'Spesa', headers: ['Data', 'Descrizione', 'Categoria', 'Importo', ''],
        cells: [{ text: '01/10/2026' }, { text: 'Render' }, { text: '  ' }, { text: '€19,00', isNum: true }, { isActions: true }],
        actions: [{ label: '' }, { label: 'Modifica' }] });
    assert.deepStrictEqual(m.rows.map(r => r.label), ['Data']);
    assert.strictEqual(m.subtitle, 'Render');
    assert.deepStrictEqual(m.actions.map(a => a.label), ['Modifica']);
});

test('regge un input vuoto', () => {
    assert.deepStrictEqual(R.buildModel({}), { title: '', subtitle: '', amount: null, amountLabel: '', rows: [], actions: [] });
});

test('la cifra grande porta la sua etichetta, tranne quando è un semplice importo', () => {
    const cliente = R.buildModel({ title: 'Cliente', headers: ['Cliente', 'Fatturato totale', ''],
        cells: [{ text: 'Aurora Academy SRL' }, { text: '€50.900,00', isNum: true }, { isActions: true }], actions: [] });
    assert.strictEqual(cliente.amount, '€50.900,00');
    assert.strictEqual(cliente.amountLabel, 'Fatturato totale');
    assert.strictEqual(R.buildModel(fattura).amountLabel, '');
});
