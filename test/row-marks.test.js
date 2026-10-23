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

test('spese e ricorrenti senza fornitore noto prendono la lettera e il colore della categoria', () => {
    assert.deepStrictEqual(M.markFor('expensesTable', { texts: ['17/10/2026', 'Sponsorizzata evento', 'Marketing', '€640,00', ''] }),
        { kind: 'text', label: 'M', color: M.categoryColor('Marketing') });
    assert.deepStrictEqual(M.markFor('recurringTable', { texts: ['Server di casa', 'Software', 'Mese', '09/2025', 'Attiva', '€19,00', ''] }),
        { kind: 'text', label: 'S', color: M.categoryColor('Software') });
});

test('Meta Ads e Render, che stanno tra le spese vere, prendono il loro logo', () => {
    assert.deepStrictEqual(M.markFor('expensesTable', { texts: ['17/10/2026', 'Meta Ads', 'Marketing', '€640,00', ''] }),
        { kind: 'logo', label: 'meta.com', fallback: 'M', color: M.categoryColor('Marketing') });
    assert.deepStrictEqual(M.markFor('recurringTable', { texts: ['Render', 'Software', 'Mese', '09/2025', 'Attiva', '€19,00', ''] }),
        { kind: 'logo', label: 'render.com', fallback: 'S', color: M.categoryColor('Software') });
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

test('i bonifici di Wise prendono le iniziali del beneficiario', () => {
    assert.strictEqual(M.markFor('wisePaymentsTable', { texts: ['11/10/2026', 'Maria Rossi', 'Compenso ottobre', 'Da confermare su Wise', '€350,00', ''] }).label, 'MR');
});

test('il fornitore si riconosce dal nome della spesa, a parola intera', () => {
    assert.strictEqual(M.vendorFor('OpenAI API'), 'openai.com');
    assert.strictEqual(M.vendorFor('Abbonamento ChatGPT Plus'), 'openai.com');
    assert.strictEqual(M.vendorFor('Render.com — backend'), 'render.com');
    assert.strictEqual(M.vendorFor('notion'), 'notion.so');
    assert.strictEqual(M.vendorFor('Northwest Registered Agent — rinnovo annuale'), 'northwestregisteredagent.com');
    assert.strictEqual(M.vendorFor('Northwest LLC'), 'northwestregisteredagent.com');
    assert.strictEqual(M.vendorFor('Registered agent Oakstone'), 'northwestregisteredagent.com');
    assert.strictEqual(M.vendorFor('Southwest Airlines'), null, 'parola intera: southwest non è northwest');
    assert.strictEqual(M.vendorFor('Google Workspace'), 'workspace.google.com');
    assert.strictEqual(M.vendorFor('Spese di rendering video'), null);
    assert.strictEqual(M.vendorFor('Affitto ufficio'), null);
    assert.strictEqual(M.vendorFor(''), null);
    assert.strictEqual(M.vendorFor(null), null);
});

test('spese e ricorrenti col fornitore noto prendono il logo, con la lettera di riserva', () => {
    const exp = M.markFor('expensesTable', { texts: ['12/10/2026', 'Apify — scraping', 'Software', '€ 30'] });
    assert.strictEqual(exp.kind, 'logo');
    assert.strictEqual(exp.label, 'apify.com');
    assert.strictEqual(exp.fallback, 'S');
    const rec = M.markFor('recurringTable', { texts: ['Canva Pro', 'Software', '€ 12'] });
    assert.strictEqual(rec.kind, 'logo');
    assert.strictEqual(rec.label, 'canva.com');
    const none = M.markFor('recurringTable', { texts: ['Commercialista', 'Consulenze', '€ 200'] });
    assert.strictEqual(none.kind, 'text');
    assert.strictEqual(M.logoUrl('apify.com'), 'https://www.google.com/s2/favicons?domain=apify.com&sz=64');
});

test('il nome attaccato al bollino si legge lo stesso, se arriva coi pezzi separati', () => {
    const m = M.markFor('expensesTable', { texts: ['', 'RenderSpesaVariabile', 'Software', ''], hostText: 'Render Spesa Variabile · da confermare' });
    assert.strictEqual(m.kind, 'logo');
    assert.strictEqual(m.label, 'render.com');
});

test('il dominio della LLC sta su Namecheap', () => {
    assert.strictEqual(M.vendorFor('Dominio LLC'), 'namecheap.com');
    assert.strictEqual(M.vendorFor('Rinnovo dominio LLC'), 'namecheap.com');
    assert.strictEqual(M.vendorFor('Dominio personale'), null);
});

test('FACEIT e NordPass hanno il loro logo', () => {
    assert.strictEqual(M.vendorFor('FACEIT'), 'faceit.com');
    assert.strictEqual(M.vendorFor('faceit.com abbonamento'), 'faceit.com');
    assert.strictEqual(M.vendorFor('NordPass Business'), 'nordpass.com');
});
