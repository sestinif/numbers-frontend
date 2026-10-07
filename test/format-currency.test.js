const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// formatCurrency vive dentro index.html: la si estrae e la si prova da sola.
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const m = html.match(/function formatCurrency\(amount, symbol = '\\u20AC'\) \{[\s\S]*?\n        \}/);
assert.ok(m, 'formatCurrency non trovata in index.html');
const formatCurrency = new Function(m[0] + '; return formatCurrency;')();

test('mette il punto delle migliaia anche a quattro cifre', () => {
    assert.strictEqual(formatCurrency(4200), '€4.200,00');
    assert.strictEqual(formatCurrency(2963.25), '€2.963,25');
});

test('lascia invariati gli importi che già uscivano giusti', () => {
    assert.strictEqual(formatCurrency(11166.5), '€11.166,50');
    assert.strictEqual(formatCurrency(950.5), '€950,50');
    assert.strictEqual(formatCurrency(0), '€0,00');
    assert.strictEqual(formatCurrency('184.30'), '€184,30');
});

test('mette il segno meno davanti al simbolo', () => {
    assert.strictEqual(formatCurrency(-439), '-€439,00');
});

test('usa il simbolo che riceve', () => {
    assert.strictEqual(formatCurrency(6400, '$'), '$6.400,00');
});
