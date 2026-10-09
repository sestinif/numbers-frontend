const test = require('node:test');
const assert = require('node:assert');
const C = require('../cost-labels.js');

test('una voce variabile non ancora confermata lo dice, in ambra', () => {
    for (const flag of [false, 'f', 0, 'false']) {
        assert.deepStrictEqual(C.expenseBadge({ auto_source: 'rule:7', cost_type: 'variable', amount_confirmed: flag }),
            { text: 'Variabile · da confermare', tone: 'pending', title: 'Importo stimato: aprila e metti la cifra della fattura' });
    }
});

test('una voce variabile confermata resta «Variabile», senza ambra', () => {
    for (const flag of [true, 't', 1, undefined]) {
        assert.deepStrictEqual(C.expenseBadge({ auto_source: 'rule:7', cost_type: 'variable', amount_confirmed: flag }),
            { text: 'Variabile', tone: 'auto', title: 'Costo variabile, cifra confermata' });
    }
});

test('una voce di una regola fissa dice «Fisso»', () => {
    assert.deepStrictEqual(C.expenseBadge({ auto_source: 'rule:3', cost_type: 'fixed', amount_confirmed: true }),
        { text: 'Fisso', tone: 'auto', title: 'Costo fisso ricorrente' });
});

test('le voci di prima, senza tipo, restano come oggi', () => {
    assert.strictEqual(C.expenseBadge({ auto_source: 'rule:3', cost_type: null, notes: 'Voce ricorrente' }).text, 'Ricorrente');
    assert.strictEqual(C.expenseBadge({ auto_source: 'openai', notes: 'Si aggiorna da sola' }).text, 'Auto');
    assert.strictEqual(C.expenseBadge({ auto_source: 'openai', notes: 'Si aggiorna da sola' }).title, 'Si aggiorna da sola');
    assert.strictEqual(C.expenseBadge({ auto_source: null }), null);
    assert.strictEqual(C.expenseBadge({}), null);
});

test('il tipo di una regola', () => {
    assert.strictEqual(C.ruleType({ cost_type: 'variable' }), 'variable');
    assert.strictEqual(C.ruleType({ cost_type: 'fixed' }), 'fixed');
    assert.strictEqual(C.ruleType({}), 'fixed');
    assert.strictEqual(C.ruleTypeLabel({ cost_type: 'variable' }), 'Variabile · stima');
    assert.strictEqual(C.ruleTypeLabel({ cost_type: 'fixed' }), 'Fisso');
    assert.strictEqual(C.ruleTypeLabel({}), 'Fisso');
});

test('i conti già usati, senza doppioni e in ordine', () => {
    const rules = [{ account: 'Revolut Business' }, { account: ' mercury ' }, { account: null }];
    const expenses = [{ account: 'Mercury' }, { account: 'Relay' }, { account: '' }, {}];
    assert.deepStrictEqual(C.knownAccounts(rules, expenses), ['mercury', 'Relay', 'Revolut Business']);
    assert.deepStrictEqual(C.knownAccounts(null, undefined), []);
});
