const test = require('node:test');
const assert = require('node:assert');
const M = require('../row-marks.js');

test('le iniziali sono le prime lettere delle prime due parole', () => {
    assert.strictEqual(M.initials('Aurora Academy SRL'), 'AA');
    assert.strictEqual(M.initials('Castello Fitness'), 'CF');
    assert.strictEqual(M.initials('  studio eridano di Marco Bianchi '), 'SE');
    assert.strictEqual(M.initials('Render'), 'R');
    assert.strictEqual(M.initials('"Blue Harbor" Trading Ltd'), 'BH');
});

test('senza nome le iniziali sono un punto di domanda', () => {
    assert.strictEqual(M.initials(''), '?');
    assert.strictEqual(M.initials(null), '?');
    assert.strictEqual(M.initials('—'), '?');
});

test('lo stesso nome prende sempre lo stesso colore, a prescindere da maiuscole e spazi', () => {
    const a = M.colorFor('Aurora Academy SRL');
    assert.ok(M.PALETTE.includes(a));
    assert.strictEqual(M.colorFor('aurora academy srl '), a);
    assert.strictEqual(M.colorFor('Aurora Academy SRL'), a);
});

test('le categorie note hanno un colore fisso e diverso tra loro', () => {
    const cats = ['Software', 'Marketing', 'Ufficio', 'Trasporti', 'Consulenze', 'Utenze', 'Personale'];
    const colors = cats.map(M.categoryColor);
    assert.strictEqual(new Set(colors).size, cats.length);
    assert.strictEqual(M.categoryColor('software'), M.categoryColor('Software'));
    assert.strictEqual(M.categoryColor('Altro'), M.NEUTRAL);
    assert.strictEqual(M.categoryColor('-'), M.NEUTRAL);
    assert.ok(M.PALETTE.includes(M.categoryColor('Categoria inventata')));
});

test('fatture, clienti e rimborsi prendono le iniziali del cliente', () => {
    assert.deepStrictEqual(M.markFor('invoicesTable', { texts: ['34', '03/10/2026', 'Aurora Academy SRL', '€4.200,00', ''] }),
        { kind: 'text', label: 'AA', color: M.colorFor('Aurora Academy SRL') });
    assert.deepStrictEqual(M.markFor('customersTable', { texts: ['Aurora Academy SRL', '€50.900,00', ''] }),
        { kind: 'text', label: 'AA', color: M.colorFor('Aurora Academy SRL') });
    assert.strictEqual(M.markFor('expenseNotesTable', { texts: ['03/10/2026', 'Volo', 'Delta Dental Group', '€184,30', 'In sospeso', ''] }).label, 'DD');
    assert.strictEqual(M.markFor('customerReportTable', { texts: ['Castello Fitness', '4', '€3.800,50', '€950,13'] }).label, 'CF');
});

test('spese e ricorrenti prendono la lettera e il colore della categoria', () => {
    assert.deepStrictEqual(M.markFor('expensesTable', { texts: ['17/10/2026', 'Meta Ads', 'Marketing', '€640,00', ''] }),
        { kind: 'text', label: 'M', color: M.categoryColor('Marketing') });
    assert.deepStrictEqual(M.markFor('recurringTable', { texts: ['Render', 'Software', 'Mese', '09/2025', 'Attiva', '€19,00', ''] }),
        { kind: 'text', label: 'S', color: M.categoryColor('Software') });
});

test('scadenze e note prendono l\'icona e il colore dello stato', () => {
    assert.deepStrictEqual(M.markFor('remindersTable', { texts: ['IVA', '16/10/2026', 'Mensile', '⏱ In attesa', ''] }),
        { kind: 'icon', label: 'calendar', color: M.STATE.pending });
    assert.deepStrictEqual(M.markFor('remindersTable', { texts: ['Agent', '28/08/2026', 'Annuale', '✓ Fatto', ''] }),
        { kind: 'icon', label: 'check', color: M.STATE.done });
    assert.deepStrictEqual(M.markFor('notesTable', { texts: ['Provvigioni', '13/10/2026', '⏱ In sospeso', ''] }),
        { kind: 'icon', label: 'note', color: M.STATE.pending });
    assert.deepStrictEqual(M.markFor('notesTable', { texts: ['Blue Harbor', '04/10/2026', '⚠ scaduta 3 giorni fa', ''], late: true }),
        { kind: 'icon', label: 'note', color: M.STATE.late });
    assert.deepStrictEqual(M.markFor('notesTable', { texts: ['Volo', '08/08/2026', '✓ Fatta', ''] }),
        { kind: 'icon', label: 'check', color: M.STATE.done });
});

test('una lista che non conosce non prende niente', () => {
    assert.strictEqual(M.markFor('monthlyReportTable', { texts: ['Gennaio', '2'] }), null);
    assert.strictEqual(M.markFor('invoicesTable', { texts: [] }), null);
});
