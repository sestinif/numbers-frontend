const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// Il logo dell'azienda non si ritaglia mai: niente border-radius sull'immagine, e il suo
// riquadro sta dentro il quadrato inscritto nel tondo (lato ≤ diametro/√2).
const css = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const rule = sel => {
    const m = css.match(new RegExp('\\n\\s*' + sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}'));
    assert.ok(m, 'manca la regola ' + sel);
    return m[1];
};
const px = (body, prop) => {
    const m = body.match(new RegExp('(?:^|[;\\s])' + prop + ':\\s*(\\d+(?:\\.\\d+)?)px'));
    return m ? parseFloat(m[1]) : null;
};

test('il logo nel tondo non ha border-radius e sta nel quadrato inscritto', () => {
    const pairs = [
        ['.company-mark', '.company-mark img'],
        ['.company-selector .company-mark', '.company-selector .company-mark img'],
        ['.logo-preview', '.logo-preview img']
    ];
    for (const [round, img] of pairs) {
        const d = px(rule(round), 'width');
        const body = rule(img);
        assert.doesNotMatch(body, /border-radius/, img);
        // object-fit: contain sta nella regola base, le varianti cambiano solo le misure.
        if (!/company-selector/.test(img)) assert.match(body, /object-fit:\s*contain/, img);
        const w = px(body, 'width'), h = px(body, 'height');
        assert.ok(d && w && h, img);
        // La diagonale del riquadro del logo resta dentro il cerchio, con almeno 1px di margine.
        assert.ok(Math.hypot(w, h) <= d - 2, `${img}: ${w}×${h} in un tondo da ${d}`);
    }
});
