// Numbers — il logo dell'azienda.
// In app il logo sta in un tondo: nel selettore in basso a sinistra, nella tendina delle
// aziende e nell'intestazione accanto al nome. Senza logo il tondo mostra le iniziali.
// Nelle fatture il logo va scuro su bianco: se l'azienda ha caricato una versione «per le
// fatture» si usa quella, altrimenti si inverte quella dell'app (va bene per i loghi di
// un colore solo). jsPDF non disegna gli SVG, quindi il logo della fattura viene prima
// ridisegnato in PNG su un canvas e tenuto da parte: la fattura lo trova già pronto.
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.CompanyLogo = api;
})(typeof self !== 'undefined' ? self : this, function () {

    const SIDE = 600; // lato lungo del PNG della fattura, in pixel

    function initials(name) {
        const words = String(name || '').replace(/["'“”«»]/g, ' ').split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w));
        if (!words.length) return '?';
        return words.slice(0, 2).map(w => w.match(/[\p{L}\p{N}]/u)[0].toUpperCase()).join('');
    }

    function isLogo(src) {
        return typeof src === 'string' && /^data:image\/(png|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(src);
    }

    function appLogo(company) {
        return company && isLogo(company.logo) ? company.logo : null;
    }

    // Quale logo va in fattura e se va invertito.
    function invoiceSource(company) {
        if (!company) return null;
        if (isLogo(company.logo_invoice)) return { src: company.logo_invoice, invert: false };
        if (isLogo(company.logo)) return { src: company.logo, invert: true };
        return null;
    }

    // Il tondo come HTML: <img> del logo o le iniziali. Il src è già un data URL controllato.
    function markHtml(company, extraClass) {
        const cls = 'company-mark' + (extraClass ? ' ' + extraClass : '');
        const src = appLogo(company);
        if (src) return `<span class="${cls}" aria-hidden="true"><img src="${src}" alt=""></span>`;
        return `<span class="${cls}" data-label="${initials(company && company.name)}" aria-hidden="true"></span>`;
    }

    // Inverte i colori di un'immagine (RGBA), lasciando com'è la trasparenza:
    // bianco su trasparente → nero su trasparente, bianco su nero → nero su bianco.
    function invertPixels(data) {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }
        return data;
    }

    // Proporzioni dell'SVG dal viewBox (o da width/height): un <img> di un SVG senza misure
    // in certi browser dice 0×0 o 300×150.
    function svgRatio(src) {
        if (!/^data:image\/svg\+xml;base64,/.test(src)) return null;
        let text = '';
        try { text = (typeof atob === 'function' ? atob : b => Buffer.from(b, 'base64').toString('binary'))(src.split(',')[1]); } catch (e) { return null; }
        const tag = (text.match(/<svg[^>]*>/) || [''])[0];
        const vb = tag.match(/viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*"/);
        if (vb && +vb[1] > 0 && +vb[2] > 0) return +vb[1] / +vb[2];
        const w = tag.match(/\swidth="([\d.]+)/), h = tag.match(/\sheight="([\d.]+)/);
        if (w && h && +w[1] > 0 && +h[1] > 0) return +w[1] / +h[1];
        return null;
    }

    function fitSize(ratio) {
        const r = ratio > 0 ? ratio : 1;
        return r >= 1 ? { w: SIDE, h: Math.max(1, Math.round(SIDE / r)) } : { w: Math.max(1, Math.round(SIDE * r)), h: SIDE };
    }

    // Logo della fattura già pronto in PNG: chiave = il src + inversione.
    const cache = new Map();
    const keyOf = source => (source.invert ? 'i:' : 'n:') + source.src;

    function rasterize(source) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => {
                try {
                    const ratio = svgRatio(source.src) || (img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1);
                    const { w, h } = fitSize(ratio);
                    const canvas = document.createElement('canvas');
                    canvas.width = w; canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    if (source.invert) {
                        const px = ctx.getImageData(0, 0, w, h);
                        invertPixels(px.data);
                        ctx.putImageData(px, 0, 0);
                    }
                    resolve({ dataUrl: canvas.toDataURL('image/png'), ratio: w / h });
                } catch (e) { resolve(null); }
            };
            img.onerror = () => resolve(null);
            img.src = source.src;
        });
    }

    // Prepara (una volta sola) il logo della fattura di un'azienda.
    function prepareInvoice(company) {
        const source = invoiceSource(company);
        if (!source || typeof Image === 'undefined') return Promise.resolve(null);
        const key = keyOf(source);
        if (!cache.has(key)) cache.set(key, rasterize(source).then(r => { cache.set(key, r); return r; }));
        return Promise.resolve(cache.get(key));
    }

    // Il logo della fattura se è già pronto, altrimenti null (la fattura esce col solo nome).
    function readyInvoice(company) {
        const source = invoiceSource(company);
        if (!source) return null;
        const hit = cache.get(keyOf(source));
        return hit && typeof hit.then !== 'function' ? hit : null;
    }

    return { initials, isLogo, appLogo, invoiceSource, markHtml, invertPixels, svgRatio, fitSize, prepareInvoice, readyInvoice };
});
