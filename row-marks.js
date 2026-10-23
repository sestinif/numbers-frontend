// Numbers — tondi di riga.
// Mette un tondo colorato all'inizio di ogni riga di lista: le iniziali del cliente,
// la lettera della categoria di spesa, un'icona per scadenze e note. Nelle spese e nelle
// spese ricorrenti, se il nome fa riconoscere il fornitore (OpenAI, Notion, Render…),
// al posto della lettera c'è il suo logo, tondo; se il logo non arriva, torna la lettera. Lo stesso cliente
// e la stessa categoria hanno sempre lo stesso colore, così si riconoscono scorrendo.
// È solo un segno in più: non tocca i dati né le funzioni di index.html. Il testo del
// tondo è disegnato dal CSS (attr), quindi non entra in ricerca, ordinamento e scheda.
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else {
        root.RowMarks = api;
        if (root.document) api.install(root.document);
    }
})(typeof self !== 'undefined' ? self : this, function () {

    // Sette tinte prese dai colori dei calendari di Calendar. Fuori i verdi, l'ambra e il
    // rosso: in Numbers vogliono dire entrata, in sospeso e scaduto.
    const PALETTE = ['#5483DC', '#9778C2', '#34C7DD', '#BB5E80', '#C36BC0', '#A87B5B', '#A2AE5F'];
    const NEUTRAL = '#9A9AA8';
    const STATE = { done: '#4FD1A1', pending: '#E2A33C', late: '#F58A9B' };
    const CATEGORY = {
        software: PALETTE[0], consulenze: PALETTE[1], trasporti: PALETTE[2], personale: PALETTE[3],
        marketing: PALETTE[4], ufficio: PALETTE[5], utenze: PALETTE[6]
    };

    function clean(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }

    // Fornitori riconosciuti dal nome della spesa: parola (o frase) → dominio del logo.
    // Solo nomi che non si confondono con parole comuni: meglio la lettera che un logo sbagliato.
    // Per aggiungerne uno basta una riga qui.
    const VENDORS = [
        ['openai', 'openai.com'], ['chatgpt', 'openai.com'], ['anthropic', 'anthropic.com'], ['claude', 'claude.ai'],
        ['gemini', 'gemini.google.com'], ['google workspace', 'workspace.google.com'], ['gsuite', 'workspace.google.com'],
        ['google cloud', 'cloud.google.com'], ['google ads', 'ads.google.com'], ['youtube', 'youtube.com'], ['google', 'google.com'],
        ['perplexity', 'perplexity.ai'], ['midjourney', 'midjourney.com'], ['elevenlabs', 'elevenlabs.io'], ['eleven labs', 'elevenlabs.io'],
        ['heygen', 'heygen.com'], ['higgsfield', 'higgsfield.ai'], ['runway', 'runwayml.com'], ['suno', 'suno.com'], ['kling', 'klingai.com'],
        ['cursor', 'cursor.com'], ['lovable', 'lovable.dev'], ['replit', 'replit.com'], ['github', 'github.com'],
        ['vercel', 'vercel.com'], ['render', 'render.com'], ['netlify', 'netlify.com'], ['cloudflare', 'cloudflare.com'],
        ['supabase', 'supabase.com'], ['turso', 'turso.tech'], ['heroku', 'heroku.com'], ['digitalocean', 'digitalocean.com'],
        ['hetzner', 'hetzner.com'], ['aws', 'aws.amazon.com'], ['amazon', 'amazon.com'], ['hostinger', 'hostinger.com'],
        ['northwest registered agent', 'northwestregisteredagent.com'], ['northwest', 'northwestregisteredagent.com'], ['registered agent', 'northwestregisteredagent.com'],
        ['godaddy', 'godaddy.com'], ['namecheap', 'namecheap.com'], ['dominio llc', 'namecheap.com'], ['aruba', 'aruba.it'], ['siteground', 'siteground.com'],
        ['apify', 'apify.com'], ['notion', 'notion.so'], ['canva', 'canva.com'], ['figma', 'figma.com'], ['adobe', 'adobe.com'],
        ['capcut', 'capcut.com'], ['descript', 'descript.com'], ['loom', 'loom.com'], ['fathom', 'fathom.video'],
        ['zoom', 'zoom.us'], ['slack', 'slack.com'], ['discord', 'discord.com'], ['telegram', 'telegram.org'],
        ['whatsapp', 'whatsapp.com'], ['calendly', 'calendly.com'], ['typeform', 'typeform.com'], ['tally', 'tally.so'],
        ['zapier', 'zapier.com'], ['make.com', 'make.com'], ['integromat', 'make.com'], ['n8n', 'n8n.io'],
        ['airtable', 'airtable.com'], ['clickup', 'clickup.com'], ['monday', 'monday.com'], ['asana', 'asana.com'],
        ['trello', 'trello.com'], ['miro', 'miro.com'], ['linear', 'linear.app'], ['dropbox', 'dropbox.com'],
        ['1password', '1password.com'], ['nordpass', 'nordpass.com'], ['nordvpn', 'nordvpn.com'], ['faceit', 'faceit.com'], ['grammarly', 'grammarly.com'], ['microsoft', 'microsoft.com'], ['office 365', 'microsoft.com'],
        ['apple', 'apple.com'], ['icloud', 'icloud.com'], ['spotify', 'spotify.com'], ['netflix', 'netflix.com'],
        ['activecampaign', 'activecampaign.com'], ['active campaign', 'activecampaign.com'], ['klaviyo', 'klaviyo.com'],
        ['mailchimp', 'mailchimp.com'], ['brevo', 'brevo.com'], ['sendinblue', 'brevo.com'], ['convertkit', 'kit.com'],
        ['bird', 'bird.com'], ['messagebird', 'bird.com'], ['smshosting', 'smshosting.it'], ['twilio', 'twilio.com'],
        ['manychat', 'manychat.com'], ['hyros', 'hyros.com'], ['clickfunnels', 'clickfunnels.com'], ['systeme', 'systeme.io'],
        ['kajabi', 'kajabi.com'], ['skool', 'skool.com'], ['shopify', 'shopify.com'], ['woocommerce', 'woocommerce.com'],
        ['stripe', 'stripe.com'], ['paypal', 'paypal.com'], ['wise', 'wise.com'], ['revolut', 'revolut.com'],
        ['mercury', 'mercury.com'], ['relay', 'relayfi.com'], ['meta ads', 'meta.com'], ['facebook', 'facebook.com'],
        ['instagram', 'instagram.com'], ['linkedin', 'linkedin.com'], ['tiktok', 'tiktok.com'], ['semrush', 'semrush.com'],
        ['ahrefs', 'ahrefs.com'], ['hotjar', 'hotjar.com'], ['clarity', 'clarity.microsoft.com'], ['fiverr', 'fiverr.com'],
        ['upwork', 'upwork.com'], ['uber', 'uber.com'], ['trenitalia', 'trenitalia.com'], ['italo', 'italotreno.com'],
        ['ryanair', 'ryanair.com'], ['airbnb', 'airbnb.com'], ['booking', 'booking.com'], ['vodafone', 'vodafone.it'],
        ['iliad', 'iliad.it'], ['fastweb', 'fastweb.it'], ['enel', 'enel.it']
    ];

    // Il fornitore nominato in un testo, come dominio del suo logo; null se non ce n'è uno noto.
    // La parola deve stare intera ("render" sì in «Render.com», no in «rendering»).
    function vendorFor(text) {
        const t = ' ' + clean(text).toLowerCase().replace(/[^\p{L}\p{N}.]+/gu, ' ') + ' ';
        if (!t.trim()) return null;
        for (const [word, domain] of VENDORS) {
            const at = t.indexOf(word);
            if (at < 0) continue;
            const before = t[at - 1], after = t[at + word.length];
            if (!/[\p{L}\p{N}]/u.test(before || ' ') && !/[\p{L}\p{N}]/u.test(after || ' ')) return domain;
        }
        return null;
    }

    function logoUrl(domain) {
        return 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(domain) + '&sz=64';
    }

    function initials(name) {
        const words = clean(name).split(' ')
            .map(w => w.replace(/[^\p{L}\p{N}]/gu, ''))
            .filter(Boolean);
        if (!words.length) return '?';
        return words.slice(0, 2).map(w => w[0].toUpperCase()).join('');
    }

    function colorFor(text) {
        const key = clean(text).toLowerCase();
        let h = 0;
        for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
        return PALETTE[h % PALETTE.length];
    }

    function categoryColor(category) {
        const key = clean(category).toLowerCase();
        if (!key || key === '-' || key === 'altro') return NEUTRAL;
        return CATEGORY[key] || colorFor(key);
    }

    // Quale colonna dà il segno, lista per lista.
    const BY_CLIENT = { invoicesTable: 2, customersTable: 0, expenseNotesTable: 2, customerReportTable: 0, companiesTable: 0, wisePaymentsTable: 1 };
    const BY_CATEGORY = { expensesTable: 2, recurringTable: 1 };
    const BY_STATE = { remindersTable: { icon: 'calendar', status: 3 }, notesTable: { icon: 'note', status: 2 } };

    // Parte pura: dato l'id della tabella e i testi delle celle, dice che tondo mettere.
    function markFor(tableId, row) {
        const texts = (row && row.texts) || [];
        if (BY_CLIENT[tableId] != null) {
            const name = clean(texts[BY_CLIENT[tableId]]);
            return name ? { kind: 'text', label: initials(name), color: colorFor(name) } : null;
        }
        if (BY_CATEGORY[tableId] != null) {
            if (!texts.length) return null;
            const cat = clean(texts[BY_CATEGORY[tableId]]);
            const letter = cat && cat !== '-' ? initials(cat)[0] : '?';
            // hostText: il titolo della riga con gli spazi tra i pezzi (nome, bollino…), se c'è.
            const vendor = vendorFor(row.hostText != null ? row.hostText : texts[HOST[tableId]]);
            if (vendor) return { kind: 'logo', label: vendor, fallback: letter, color: categoryColor(cat) };
            return { kind: 'text', label: letter, color: categoryColor(cat) };
        }
        const st = BY_STATE[tableId];
        if (st) {
            if (!texts.length) return null;
            const status = clean(texts[st.status]).toLowerCase();
            if (/fatt[ao]/.test(status)) return { kind: 'icon', label: 'check', color: STATE.done };
            return { kind: 'icon', label: st.icon, color: row.late ? STATE.late : STATE.pending };
        }
        return null;
    }

    const ICONS = {
        check: '<polyline points="20 6 9 17 4 12"/>',
        calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
        note: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="14 3 14 9 20 9"/>'
    };
    // La cella che ospita il tondo: quella del titolo della riga.
    const HOST = {
        invoicesTable: 2, customersTable: 0, expensesTable: 1, recurringTable: 0,
        expenseNotesTable: 1, remindersTable: 0, notesTable: 0, customerReportTable: 0, companiesTable: 0,
        wisePaymentsTable: 1
    };

    function install(doc) {
        function decorate(table) {
            const tbody = table.tBodies[0];
            if (!tbody) return;
            Array.from(tbody.rows).forEach(row => {
                const host = row.cells[HOST[table.id]];
                if (!host || host.classList.contains('empty-state') || row.querySelector('.skeleton')) return;
                const mark = markFor(table.id, {
                    texts: Array.from(row.cells).map(td => td.textContent),
                    // textContent incolla nome e bollino («RenderSpesa…»): per il fornitore servono gli spazi.
                    hostText: Array.from(host.childNodes).filter(n => !(n.classList && n.classList.contains('row-mark'))).map(n => n.textContent).join(' '),
                    late: !!row.querySelector('span[style*="--danger"]')
                });
                const old = host.querySelector(':scope > .row-mark');
                if (!mark) { if (old) old.remove(); return; }
                const sign = mark.kind + ':' + mark.label + ':' + mark.color;
                if (old && old.dataset.sign === sign) return;
                const el = old || doc.createElement('span');
                el.className = 'row-mark';
                el.dataset.sign = sign;
                el.setAttribute('aria-hidden', 'true');
                el.style.setProperty('--mark', mark.color);
                if (mark.kind === 'logo') {
                    // Il dominio viene dall'elenco qui sopra, non dai dati: nessun testo dell'utente nell'URL.
                    el.removeAttribute('data-label');
                    el.textContent = '';
                    const img = doc.createElement('img');
                    img.alt = '';
                    img.decoding = 'async';
                    img.referrerPolicy = 'no-referrer';
                    img.onerror = () => { img.remove(); el.dataset.label = mark.fallback; };
                    img.src = logoUrl(mark.label);
                    el.appendChild(img);
                } else if (mark.kind === 'icon') {
                    el.removeAttribute('data-label');
                    // Solo costanti: nessun testo che arriva dai dati finisce in innerHTML.
                    el.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + ICONS[mark.label] + '</svg>';
                } else {
                    el.textContent = '';
                    el.dataset.label = mark.label;
                }
                if (!old) host.prepend(el);
            });
        }

        Object.keys(HOST).forEach(id => {
            const table = doc.getElementById(id);
            const tbody = table && table.tBodies[0];
            if (!tbody) return;
            table.classList.add('has-marks');
            decorate(table);
            // Le righe vengono ridisegnate a ogni caricamento e spostate quando si ordina.
            new MutationObserver(() => decorate(table)).observe(tbody, { childList: true });
        });
    }

    return { initials, colorFor, categoryColor, vendorFor, logoUrl, markFor, install, PALETTE, NEUTRAL, STATE };
});
