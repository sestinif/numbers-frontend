const test = require('node:test');
const assert = require('node:assert');
const P = require('../period.js');

const NOW = new Date(2026, 9, 10); // 10 ottobre 2026

test('si parte dal mese in corso', () => {
    assert.deepStrictEqual(P.current(NOW), { mode: 'M', year: 2026, month: 10 });
});

test('l\'etichetta dice mese e anno, solo l\'anno, oppure Tutto', () => {
    assert.strictEqual(P.label({ mode: 'M', year: 2026, month: 10 }), 'Ottobre 2026');
    assert.strictEqual(P.label({ mode: 'M', year: 2025, month: 1 }), 'Gennaio 2025');
    assert.strictEqual(P.label({ mode: 'A', year: 2026, month: 10 }), '2026');
    assert.strictEqual(P.label({ mode: 'T', year: 2026, month: 10 }), 'Tutto');
});

test('una data sta nel periodo se cade in quel mese, in quell\'anno, o sempre con Tutto', () => {
    const ott = { mode: 'M', year: 2026, month: 10 };
    assert.strictEqual(P.contains(ott, '2026-10-14'), true);
    assert.strictEqual(P.contains(ott, '2026-10-14T00:00:00.000Z'), true);
    assert.strictEqual(P.contains(ott, '2026-09-14'), false);
    assert.strictEqual(P.contains(ott, '2025-10-14'), false);
    const anno = { mode: 'A', year: 2026, month: 10 };
    assert.strictEqual(P.contains(anno, '2026-02-14'), true);
    assert.strictEqual(P.contains(anno, '2025-12-14'), false);
    const tutto = { mode: 'T', year: 2026, month: 10 };
    assert.strictEqual(P.contains(tutto, '2019-02-14'), true);
});

test('una data vuota o illeggibile resta fuori da mese e anno, ma dentro Tutto', () => {
    assert.strictEqual(P.contains({ mode: 'M', year: 2026, month: 10 }, null), false);
    assert.strictEqual(P.contains({ mode: 'A', year: 2026, month: 10 }, 'boh'), false);
    assert.strictEqual(P.contains({ mode: 'T', year: 2026, month: 10 }, null), true);
});

test('filter tiene solo le righe del periodo, leggendo la data come gli si dice', () => {
    const rows = [
        { id: 1, expense_date: '2026-10-05' },
        { id: 2, date: '2026-10-20' },
        { id: 3, expense_date: '2026-09-20' },
    ];
    const got = P.filter(rows, r => r.expense_date || r.date, { mode: 'M', year: 2026, month: 10 });
    assert.deepStrictEqual(got.map(r => r.id), [1, 2]);
    assert.strictEqual(P.filter(rows, r => r.expense_date || r.date, { mode: 'T', year: 2026, month: 10 }).length, 3);
});

test('le frecce spostano di un mese e girano l\'anno a gennaio e dicembre', () => {
    assert.deepStrictEqual(P.shift({ mode: 'M', year: 2026, month: 10 }, -1, NOW), { mode: 'M', year: 2026, month: 9 });
    assert.deepStrictEqual(P.shift({ mode: 'M', year: 2026, month: 12 }, 1, NOW), { mode: 'M', year: 2027, month: 1 });
    assert.deepStrictEqual(P.shift({ mode: 'M', year: 2026, month: 1 }, -1, NOW), { mode: 'M', year: 2025, month: 12 });
});

test('con Anno le frecce spostano di un anno', () => {
    assert.deepStrictEqual(P.shift({ mode: 'A', year: 2026, month: 10 }, -1, NOW), { mode: 'A', year: 2025, month: 10 });
    assert.deepStrictEqual(P.shift({ mode: 'A', year: 2026, month: 10 }, 1, NOW), { mode: 'A', year: 2027, month: 10 });
});

test('da Tutto una freccia riporta al mese in corso, senza spostarsi', () => {
    assert.deepStrictEqual(P.shift({ mode: 'T', year: 2024, month: 3 }, -1, NOW), { mode: 'M', year: 2026, month: 10 });
});

test('cambiare vista tiene il mese e l\'anno che si stavano guardando', () => {
    const set = { mode: 'M', year: 2026, month: 9 };
    assert.deepStrictEqual(P.withMode(set, 'A'), { mode: 'A', year: 2026, month: 9 });
    assert.deepStrictEqual(P.withMode(P.withMode(set, 'T'), 'M'), { mode: 'M', year: 2026, month: 9 });
    assert.deepStrictEqual(P.withMode(set, 'boh'), set);
});

test('il periodo di confronto è il mese prima, l\'anno prima, o niente con Tutto', () => {
    assert.deepStrictEqual(P.previous({ mode: 'M', year: 2026, month: 10 }), { mode: 'M', year: 2026, month: 9 });
    assert.deepStrictEqual(P.previous({ mode: 'M', year: 2026, month: 1 }), { mode: 'M', year: 2025, month: 12 });
    assert.deepStrictEqual(P.previous({ mode: 'A', year: 2026, month: 10 }), { mode: 'A', year: 2025, month: 10 });
    assert.strictEqual(P.previous({ mode: 'T', year: 2026, month: 10 }), null);
});

test('il confronto ha un nome leggibile', () => {
    assert.strictEqual(P.previousLabel({ mode: 'M', year: 2026, month: 10 }), 'settembre');
    assert.strictEqual(P.previousLabel({ mode: 'A', year: 2026, month: 10 }), '2025');
    assert.strictEqual(P.previousLabel({ mode: 'T', year: 2026, month: 10 }), '');
});

test('si ricorda solo la vista: alla riapertura mese e anno sono quelli di oggi', () => {
    const box = {};
    const storage = { getItem: k => (k in box ? box[k] : null), setItem: (k, v) => { box[k] = String(v); } };
    P.save(storage, { mode: 'A', year: 2024, month: 3 });
    assert.deepStrictEqual(P.load(storage, NOW), { mode: 'A', year: 2026, month: 10 });
    P.save(storage, { mode: 'T', year: 2024, month: 3 });
    assert.deepStrictEqual(P.load(storage, NOW), { mode: 'T', year: 2026, month: 10 });
});

test('senza memoria, o con la memoria rotta, si parte dal mese in corso', () => {
    assert.deepStrictEqual(P.load({ getItem: () => null }, NOW), { mode: 'M', year: 2026, month: 10 });
    assert.deepStrictEqual(P.load({ getItem: () => 'X' }, NOW), { mode: 'M', year: 2026, month: 10 });
    assert.deepStrictEqual(P.load({ getItem: () => { throw new Error('bloccata'); } }, NOW), { mode: 'M', year: 2026, month: 10 });
    assert.doesNotThrow(() => P.save({ setItem: () => { throw new Error('bloccata'); } }, { mode: 'M', year: 2026, month: 10 }));
    assert.deepStrictEqual(P.load(null, NOW), { mode: 'M', year: 2026, month: 10 });
});

test('un periodo è «vecchio» se finisce prima del mese da cui i dati sono precisi', () => {
    const FROM = '2026-10';
    assert.strictEqual(P.endsBefore({ mode: 'M', year: 2026, month: 9 }, FROM), true);
    assert.strictEqual(P.endsBefore({ mode: 'M', year: 2025, month: 12 }, FROM), true);
    assert.strictEqual(P.endsBefore({ mode: 'M', year: 2026, month: 10 }, FROM), false);
    assert.strictEqual(P.endsBefore({ mode: 'M', year: 2027, month: 1 }, FROM), false);
    // Un anno intero finisce a dicembre: il 2026 arriva oltre ottobre, il 2025 no.
    assert.strictEqual(P.endsBefore({ mode: 'A', year: 2025, month: 10 }, FROM), true);
    assert.strictEqual(P.endsBefore({ mode: 'A', year: 2026, month: 3 }, FROM), false);
    // «Tutto» arriva fino a oggi.
    assert.strictEqual(P.endsBefore({ mode: 'T', year: 2020, month: 1 }, FROM), false);
});

test('il mese da cui i dati sono precisi si scrive per esteso', () => {
    assert.strictEqual(P.monthLabel('2026-10'), 'ottobre 2026');
    assert.strictEqual(P.monthLabel('2027-01'), 'gennaio 2027');
});
