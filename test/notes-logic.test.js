const test = require('node:test');
const assert = require('node:assert');
const L = require('../notes-logic.js');

const OGGI = '2026-09-23';

function nota(over) {
    return Object.assign({
        id: 1, title: 'Nota', body: '', due_date: OGGI,
        done: false, snoozed_until: null
    }, over);
}

test('toISODate normalizza stringhe e Date', () => {
    assert.strictEqual(L.toISODate('2026-09-23'), '2026-09-23');
    assert.strictEqual(L.toISODate('2026-09-23T00:00:00.000Z'), '2026-09-23');
    assert.strictEqual(L.toISODate(new Date(2026, 8, 23)), '2026-09-23');
    assert.strictEqual(L.toISODate(null), '');
});

test('daysBetween conta i giorni anche a cavallo dell ora legale', () => {
    assert.strictEqual(L.daysBetween('2026-09-23', '2026-09-23'), 0);
    assert.strictEqual(L.daysBetween('2026-09-22', '2026-09-23'), 1);
    assert.strictEqual(L.daysBetween('2026-09-23', '2026-09-22'), -1);
    // l ora legale in Italia finisce il 25 ottobre 2026
    assert.strictEqual(L.daysBetween('2026-10-24', '2026-10-26'), 2);
});

test('tomorrowISO passa al mese e all anno successivo', () => {
    assert.strictEqual(L.tomorrowISO('2026-09-23'), '2026-09-24');
    assert.strictEqual(L.tomorrowISO('2026-09-30'), '2026-10-01');
    assert.strictEqual(L.tomorrowISO('2026-12-31'), '2027-01-01');
});

test('una nota in scadenza oggi finisce nell alert', () => {
    const r = L.selectNotesForAlert([nota()], OGGI);
    assert.strictEqual(r.length, 1);
});

test('una nota gia scaduta resta nell alert', () => {
    const r = L.selectNotesForAlert([nota({ due_date: '2026-09-19' })], OGGI);
    assert.strictEqual(r.length, 1);
});

test('una nota futura non finisce nell alert', () => {
    const r = L.selectNotesForAlert([nota({ due_date: '2026-09-24' })], OGGI);
    assert.strictEqual(r.length, 0);
});

test('una nota chiusa non finisce nell alert', () => {
    const r = L.selectNotesForAlert([nota({ done: true })], OGGI);
    assert.strictEqual(r.length, 0);
});

test('il rinvio a domani nasconde la nota oggi', () => {
    const r = L.selectNotesForAlert([nota({ snoozed_until: '2026-09-24' })], OGGI);
    assert.strictEqual(r.length, 0);
});

test('un rinvio gia passato rimette la nota nell alert', () => {
    const r = L.selectNotesForAlert([nota({ snoozed_until: '2026-09-22' })], OGGI);
    assert.strictEqual(r.length, 1);
});

test('un rinvio a oggi rimette la nota nell alert', () => {
    const r = L.selectNotesForAlert([nota({ snoozed_until: OGGI })], OGGI);
    assert.strictEqual(r.length, 1);
});

test('le note nell alert escono dalla piu vecchia alla piu recente', () => {
    const r = L.selectNotesForAlert([
        nota({ id: 1, due_date: '2026-09-23' }),
        nota({ id: 2, due_date: '2026-09-10' }),
        nota({ id: 3, due_date: '2026-09-18' })
    ], OGGI);
    assert.deepStrictEqual(r.map(n => n.id), [2, 3, 1]);
});

test('il badge ignora il rinvio ma non la chiusura', () => {
    const notes = [
        nota({ id: 1 }),
        nota({ id: 2, snoozed_until: '2026-09-24' }),
        nota({ id: 3, done: true }),
        nota({ id: 4, due_date: '2026-10-01' })
    ];
    assert.strictEqual(L.countBadgeNotes(notes, OGGI), 2);
    assert.strictEqual(L.selectNotesForAlert(notes, OGGI).length, 1);
});

test('selectNotesForAlert regge una lista vuota o assente', () => {
    assert.deepStrictEqual(L.selectNotesForAlert([], OGGI), []);
    assert.deepStrictEqual(L.selectNotesForAlert(null, OGGI), []);
    assert.strictEqual(L.countBadgeNotes(null, OGGI), 0);
});

test('formatDueLabel dice oggi, i giorni passati e quelli che mancano', () => {
    assert.strictEqual(L.formatDueLabel('2026-09-23', OGGI), 'oggi');
    assert.strictEqual(L.formatDueLabel('2026-09-22', OGGI), 'scaduta 1 giorno fa');
    assert.strictEqual(L.formatDueLabel('2026-09-19', OGGI), 'scaduta 4 giorni fa');
    assert.strictEqual(L.formatDueLabel('2026-09-24', OGGI), 'domani');
    assert.strictEqual(L.formatDueLabel('2026-09-28', OGGI), 'fra 5 giorni');
});

test('il campo done arriva anche come stringa dal database', () => {
    assert.strictEqual(L.selectNotesForAlert([nota({ done: 'f' })], OGGI).length, 1);
    assert.strictEqual(L.selectNotesForAlert([nota({ done: 't' })], OGGI).length, 0);
});
