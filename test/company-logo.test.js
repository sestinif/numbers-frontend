const test = require('node:test');
const assert = require('node:assert');
const L = require('../company-logo.js');

const svg = text => 'data:image/svg+xml;base64,' + Buffer.from(text).toString('base64');
const WHITE = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1000"><path fill="#fff" d="M0 0"/></svg>');
const BLACK = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path fill="#000" d="M0 0"/></svg>');

test('senza logo il tondo mostra le iniziali dell\'azienda', () => {
    assert.strictEqual(L.initials('Oakstone Thirteen LLC'), 'OT');
    assert.strictEqual(L.initials('Scaling Catalyst LLC'), 'SC');
    assert.strictEqual(L.initials('Northwind'), 'N');
    assert.strictEqual(L.initials(''), '?');
    const html = L.markHtml({ name: 'Oakstone Thirteen LLC' });
    assert.match(html, /data-label="OT"/);
    assert.doesNotMatch(html, /<img/);
});

test('con il logo il tondo ha l\'immagine, niente iniziali', () => {
    const html = L.markHtml({ name: 'Oakstone Thirteen LLC', logo: WHITE });
    assert.match(html, /^<span class="company-mark" aria-hidden="true"><img src="data:image\/svg\+xml;base64,[^"]+" alt=""><\/span>$/);
    assert.doesNotMatch(html, /data-label/);
});

test('un logo che non è un data URL SVG/PNG non entra nella pagina', () => {
    for (const bad of ['https://evil.example/x.svg', 'data:text/html;base64,PHNjcmlwdD4=', 'data:image/svg+xml;base64,AA" onerror="x', '', null, 42]) {
        assert.strictEqual(L.isLogo(bad), false, String(bad));
        assert.doesNotMatch(L.markHtml({ name: 'X', logo: bad }), /<img/);
    }
    assert.strictEqual(L.isLogo('data:image/png;base64,iVBORw0KGgo='), true);
});

test('in fattura: prima il logo «per le fatture», se no quello dell\'app invertito', () => {
    assert.deepStrictEqual(L.invoiceSource({ logo: WHITE, logo_invoice: BLACK }), { src: BLACK, invert: false });
    assert.deepStrictEqual(L.invoiceSource({ logo: WHITE }), { src: WHITE, invert: true });
    assert.deepStrictEqual(L.invoiceSource({ logo_invoice: BLACK }), { src: BLACK, invert: false });
    assert.strictEqual(L.invoiceSource({ name: 'Senza logo' }), null);
    assert.strictEqual(L.invoiceSource(null), null);
});

test('l\'inversione: bianco diventa nero, la trasparenza resta', () => {
    const px = new Uint8ClampedArray([255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 255, 200, 100, 50, 128]);
    assert.deepStrictEqual([...L.invertPixels(px)], [0, 0, 0, 255, 0, 0, 0, 0, 255, 255, 255, 255, 55, 155, 205, 128]);
});

test('le proporzioni dell\'SVG vengono dal viewBox, il PNG della fattura tiene il lato lungo a 600', () => {
    assert.strictEqual(L.svgRatio(WHITE), 2);
    assert.strictEqual(L.svgRatio(svg('<svg width="30" height="60"></svg>')), 0.5);
    assert.strictEqual(L.svgRatio('data:image/png;base64,iVBORw0KGgo='), null);
    assert.deepStrictEqual(L.fitSize(2), { w: 600, h: 300 });
    assert.deepStrictEqual(L.fitSize(0.5), { w: 300, h: 600 });
    assert.deepStrictEqual(L.fitSize(null), { w: 600, h: 600 });
});

test('fuori dal browser la fattura esce col solo nome, senza errori', async () => {
    assert.strictEqual(await L.prepareInvoice({ logo: WHITE }), null);
    assert.strictEqual(L.readyInvoice({ logo: WHITE }), null);
    assert.strictEqual(L.readyInvoice({}), null);
});
