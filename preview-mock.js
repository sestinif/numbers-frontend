// Numbers — dati finti per l'anteprima locale. NON va online (.vercelignore).
// Intercetta fetch verso l'API e risponde con un'azienda di esempio, così index.html
// gira con lo stile e lo script veri, senza login e senza backend.
(function () {
    const API = 'http://localhost:3000/api';
    const params = new URLSearchParams(location.search);
    const today = new Date();
    const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const dayOffset = n => { const d = new Date(today); d.setDate(d.getDate() + n); return iso(d); };
    const monthDay = (back, day) => iso(new Date(today.getFullYear(), today.getMonth() - back, day));
    const period = back => monthDay(back, 1).slice(0, 7);

    const companies = [
        { id: 1, name: 'Northwind Studio LLC', address: '30 N Gould St, Sheridan, WY 82801', email: 'billing@northwind.example', tax_id: '00-0000000', payment_info: 'IBAN XX00 0000 0000 0000' },
        { id: 2, name: 'Atelier Verdi SRL', address: 'Via Roma 1, Milano', email: 'info@atelierverdi.example' }
    ];
    const customers = [
        { id: 1, name: 'Aurora Academy SRL', address: 'Via Dante 12, Bologna', vat_number: 'IT00000000001' },
        { id: 2, name: 'Blue Harbor Trading Ltd', address: '12 Quay St, Valletta', vat_number: 'MT00000001' },
        { id: 3, name: 'Castello Fitness', address: 'Corso Italia 4, Torino', vat_number: 'IT00000000003' },
        { id: 4, name: 'Delta Dental Group', address: 'Viale Europa 88, Roma', vat_number: 'IT00000000004' },
        { id: 5, name: 'Studio Eridano di Marco Bianchi e Associati', address: 'Piazza Duomo 2, Firenze', vat_number: 'IT00000000005' },
        { id: 6, name: 'Fjord Wellness AS', address: 'Storgata 9, Oslo', vat_number: 'NO000000006' }
    ];
    // [mesi fa, giorno, cliente, totale, valuta]
    const plan = [
        [0, 3, 1, 4200, 'EUR'], [0, 5, 4, 1850, 'EUR'],
        [1, 2, 1, 4200, 'EUR'], [1, 9, 2, 6400, 'USD'], [1, 18, 3, 950.5, 'EUR'], [1, 26, 5, 2300, 'EUR'],
        [2, 4, 1, 4200, 'EUR'], [2, 15, 4, 1850, 'EUR'], [2, 22, 6, 3100, 'EUR'],
        [3, 3, 1, 4200, 'EUR'], [3, 11, 2, 5200, 'USD'], [3, 27, 3, 1200, 'EUR'],
        [4, 5, 1, 3800, 'EUR'], [4, 19, 5, 2300, 'EUR'],
        [5, 2, 1, 3800, 'EUR'], [5, 14, 4, 1650, 'EUR'], [5, 23, 6, 2750, 'EUR'],
        [6, 6, 1, 3800, 'EUR'], [6, 20, 2, 4100, 'USD'],
        [7, 4, 1, 3500, 'EUR'], [7, 16, 3, 890, 'EUR'], [7, 25, 5, 2100, 'EUR'],
        [8, 3, 1, 3500, 'EUR'], [8, 21, 4, 1650, 'EUR'],
        [9, 7, 1, 3500, 'EUR'], [9, 18, 2, 3900, 'USD'],
        [10, 5, 1, 3200, 'EUR'], [10, 22, 6, 2400, 'EUR'],
        [11, 4, 1, 3200, 'EUR'], [11, 15, 3, 760, 'EUR'],
        [13, 6, 1, 2900, 'EUR'], [14, 9, 2, 3100, 'USD'], [15, 12, 1, 2900, 'EUR'], [17, 3, 4, 1400, 'EUR']
    ];
    const invoices = plan.map((p, i) => ({
        id: 100 + i, invoice_number: plan.length - i, invoice_date: monthDay(p[0], p[1]),
        customer_id: p[2], total: p[3], currency: p[4],
        items: [{ description: 'Consulenza marketing', amount: p[3] }]
    })).filter(inv => inv.invoice_date <= iso(today));

    const expenses = [];
    let eid = 500;
    for (let b = 0; b < 14; b++) {
        // Render è variabile: il mese in corso è ancora una stima, i due prima sono confermati, quelli vecchi non hanno il tipo.
        expenses.push(b < 3
            ? { id: eid++, expense_date: monthDay(b, 5), description: 'Render', category: 'Software', amount: b === 0 ? 30 : 26.4 + b, auto_source: 'rule:1', notes: 'Spesa ricorrente', account: 'Revolut Business', cost_type: 'variable', amount_confirmed: b !== 0 }
            : { id: eid++, expense_date: monthDay(b, 1), description: 'Render', category: 'Software', amount: 19, auto_source: 'rule:1', notes: 'Spesa ricorrente' });
        expenses.push(b < 3
            ? { id: eid++, expense_date: monthDay(b, 1), description: 'Vercel Pro', category: 'Software', amount: 20, auto_source: 'rule:2', notes: 'Spesa ricorrente', account: 'Mercury', cost_type: 'fixed', amount_confirmed: true }
            : { id: eid++, expense_date: monthDay(b, 1), description: 'Vercel Pro', category: 'Software', amount: 20, auto_source: 'rule:2', notes: 'Spesa ricorrente' });
        expenses.push({ id: eid++, expense_date: monthDay(b, 28), description: 'API OpenAI', category: 'Software', amount: 12.4 + b * 3.1, auto_source: 'openai', notes: 'Si aggiorna da sola' });
        expenses.push({ id: eid++, expense_date: monthDay(b, 12), description: 'Commercialista', category: 'Consulenze', amount: 350, account: b < 2 ? 'Mercury' : null });
        // Una spesa in dollari: la cifra scritta resta in amount_original, amount è in euro.
        // Una spesa col sito del fornitore: il logo arriva da lì, non dal nome.
        expenses.push({ id: eid++, expense_date: monthDay(b, 8), description: 'Unique Suite Number', category: 'Ufficio', amount: 25, currency: 'USD', amount_original: 29, link: 'https://www.northwestregisteredagent.com' });
        expenses.push({ id: eid++, expense_date: monthDay(b, 6), description: 'Higgsfield', category: 'Software', amount: 25.81, currency: 'USD', amount_original: 29, account: 'Mercury' });
        if (b % 2 === 0) expenses.push({ id: eid++, expense_date: monthDay(b, 17), description: 'Meta Ads — campagna lead generation di ottobre', category: 'Marketing', amount: 640 + b * 25 });
        if (b % 3 === 0) expenses.push({ id: eid++, expense_date: monthDay(b, 21), description: 'Volo Malta-Bologna', category: 'Rimborso fatturato', amount: 184.3 });
    }
    const liveExpenses = expenses.filter(e => e.expense_date <= iso(today));
    if (params.get('neg') === '1') liveExpenses.push({ id: eid++, expense_date: dayOffset(0), description: 'Acquisto attrezzatura', category: 'Ufficio', amount: 9800 });

    const recurring = [
        { id: 1, name: 'Render', category: 'Software', frequency: 'monthly', day_of_month: 14, start_period: period(13), end_period: null, amount: 30, account: 'Revolut Business', cost_type: 'variable', link: 'https://dashboard.render.com/billing' },
        { id: 2, name: 'Vercel Pro', category: 'Software', frequency: 'monthly', day_of_month: 1, start_period: period(13), end_period: null, amount: 20, account: 'Mercury', cost_type: 'fixed' },
        { id: 5, name: 'Higgsfield', category: 'Software', frequency: 'monthly', day_of_month: 6, start_period: period(6), end_period: null, amount: 29, currency: 'USD', account: 'Mercury', cost_type: 'fixed' },
        { id: 3, name: 'Dominio scalingcatalyst.com', category: 'Software', frequency: 'yearly', day_of_month: 10, start_period: period(9), end_period: null, amount: 24, account: 'Revolut Business', cost_type: 'fixed' },
        { id: 4, name: 'Notion Team', category: 'Software', frequency: 'monthly', day_of_month: 5, start_period: period(11), end_period: period(2), amount: 16 }
    ];
    const reminders = [
        { id: 1, title: 'Dichiarazione IVA trimestrale', due_date: dayOffset(9), recurrence: 'monthly', completed: false },
        { id: 2, title: 'Rapporto annuale LLC', due_date: dayOffset(24), recurrence: 'yearly', completed: false },
        { id: 3, title: 'Dichiarazione redditi', due_date: dayOffset(95), recurrence: 'yearly', completed: false },
        { id: 4, title: 'Rinnovo registered agent', due_date: dayOffset(-40), recurrence: 'yearly', completed: true }
    ];
    if (params.get('today') === '1') reminders.push({ id: 9, title: 'Scadenza di oggi', due_date: dayOffset(0), recurrence: 'once', completed: false });

    const noteDueToday = params.get('alert') === '1';
    const notes = [
        { id: 1, title: 'Provvigioni Deb agosto da recuperare', body: 'Ciao Federico,\n\nti confermo le provvigioni arretrate di agosto: 61,31 €.\nVanno inserite nella fattura del mese prossimo, come voce a parte.\n\nGrazie,\nDeb', due_date: noteDueToday ? dayOffset(0) : dayOffset(6), done: false, snoozed_until: null },
        { id: 2, title: 'Chiedere a Blue Harbor il nuovo indirizzo di fatturazione', body: '', due_date: noteDueToday ? dayOffset(-3) : dayOffset(14), done: false, snoozed_until: null },
        { id: 3, title: 'Rimborso volo di giugno', body: 'Messo in fattura 24.', due_date: dayOffset(-60), done: true, snoozed_until: null }
    ];
    const expenseNotes = [
        { id: 1, date: dayOffset(-4), description: 'Volo Malta-Bologna', customer_name: 1, amount: 184.3, completed: false, action_type: 'invoice', notes: 'Andata e ritorno, evento di ottobre', receipts_count: 2 },
        { id: 2, date: dayOffset(-11), description: 'Hotel Milano, due notti', customer_name: 4, amount: 312, completed: false, action_type: 'invoice', notes: '', receipts_count: 0 },
        { id: 3, date: dayOffset(-48), description: 'Taxi aeroporto', customer_name: 1, amount: 46.5, completed: true, action_type: 'invoice', notes: '', receipts_count: 1 }
    ];

    const mailMock = {
        configured: true, from: 'info@northwindstudio.example', copyToOwner: true,
        sent: [
            { id: 3, recipients: 'amministrazione@aurora-academy.example', subject: 'Fattura n. 34 del 03/10/2026 — Northwind Studio LLC', excerpt: 'Buongiorno, in allegato la fattura n. 34…', attachments: 'Fattura_34.pdf', invoice_id: 34, created_at: dayOffset(0) },
            { id: 2, recipients: 'studio@eridano.example, marco@eridano.example', subject: 'Documenti per la chiusura del trimestre', excerpt: 'Ciao Marco, ti mando…', attachments: 'estratto.pdf, riepilogo.xlsx', invoice_id: null, created_at: dayOffset(-4) },
            { id: 1, recipients: 'info@castellofitness.example', subject: 'Fattura n. 31 del 12/09/2026 — Northwind Studio LLC', excerpt: 'Buongiorno…', attachments: 'Fattura_31.pdf', invoice_id: 31, created_at: dayOffset(-29) }
        ]
    };
    const wiseMock = {
        configured: true, changed: 0, directSend: params.get('nodirect') !== '1',
        balances: [{ currency: 'USD', amount: 12480 }, { currency: 'EUR', amount: 3210.5 }, { currency: 'GBP', amount: 0 }],
        recipients: [
            { id: 5, name: 'Maria Rossi', currency: 'EUR', country: 'IT', type: 'iban', account: 'IT60 •••• 3456', label: 'Assistente', withdrawal: 'half' },
            { id: 6, name: 'Blue Frame Video Ltd', currency: 'USD', country: 'US', type: 'aba', account: '•••• 6789', label: 'Video editor' },
            { id: 8, name: 'Maria Rossi', currency: 'EUR', country: 'LT', type: 'iban', account: 'LT43 •••• 3594', label: 'Assistente – conto Revolut', withdrawal: 'all' },
            { id: 7, name: 'Studio Eridano di Marco Bianchi e Associati', currency: 'EUR', country: 'IT', type: 'iban', account: 'IT12 •••• 9012' }
        ],
        payments: [
            { id: 3, recipient_name: 'Maria Rossi', recipient_label: 'Assistente', target_amount: '350.00', target_currency: 'EUR', source_amount: '350.62', source_currency: 'EUR', fee: '0.62', reference: 'Compenso ottobre', category: 'Personale', status: 'incoming_payment_waiting', state: 'waiting', status_label: 'Da confermare su Wise', expense_id: null, created_at: dayOffset(0) },
            { id: 2, recipient_name: 'Blue Frame Video Ltd', target_amount: '420.00', target_currency: 'USD', source_amount: '420.00', source_currency: 'USD', fee: '0.39', reference: 'Montaggi settembre', category: 'Marketing', status: 'outgoing_payment_sent', state: 'paid', status_label: 'Inviato', expense_id: 41, created_at: dayOffset(-13) },
            { id: 1, recipient_name: 'Studio Eridano di Marco Bianchi e Associati', target_amount: '350.00', target_currency: 'EUR', source_amount: '350.62', source_currency: 'EUR', fee: '0.62', reference: '', category: 'Consulenze', status: 'cancelled', state: 'cancelled', status_label: 'Annullato', expense_id: null, created_at: dayOffset(-29) }
        ]
    };
    const tables = { customers, invoices, expenses: liveExpenses, reminders, 'expense-notes': expenseNotes, notes, recurring };
    const empty = params.get('empty') === '1';
    const noCompany = params.get('nocompany') === '1';
    const json = body => Promise.resolve(new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    const realFetch = window.fetch.bind(window);
    window.fetch = function (url, opts) {
        const u = String(url);
        if (!u.startsWith(API)) return realFetch(url, opts);
        const method = (opts && opts.method) || 'GET';
        const path = u.slice(API.length).split('?')[0];
        if (method === 'POST' && /\/accounts\/move$/.test(path)) {
            const b = JSON.parse(opts.body || '{}');
            return json({ expenses: 3, rules: 2, to: b.to });
        }
        if (method === 'POST' && /\/accounts\/move$/.test(path)) {
            const b = JSON.parse(opts.body || '{}');
            return json({ expenses: 3, rules: 2, to: b.to });
        }
        // Posta in sola lettura: ?noinbox=1 la nasconde, ?inboxerr=1 mostra l'errore della casella.
        if (/\/inbox$/.test(path)) return json(params.get('noinbox') === '1' ? { enabled: false, address: null } : { enabled: true, address: 'info@oakstonethirteen.com' });
        if (/\/inbox\/unread$/.test(path)) return json(params.get('nounread') === '1' ? { count: 0, uids: [] } : { count: 3, uids: [2000, 1999, 1997] });
        if (/\/inbox\/folders$/.test(path)) {
            if (params.get('inboxerr') === '1') return Promise.resolve(new Response(JSON.stringify({ error: 'La casella ha rifiutato utente o password: controlla IMAP_USER e IMAP_PASS su Render.' }), { status: 502, headers: { 'Content-Type': 'application/json' } }));
            return json({ folders: [{ path: 'INBOX', name: 'INBOX' }, { path: 'Sent', name: 'Inviata' }, { path: 'Spam', name: 'Spam' }] });
        }
        if (/\/inbox\/messages$/.test(path)) {
            const page = Number(new URLSearchParams(u.split('?')[1] || '').get('page') || 0);
            const msgs = Array.from({ length: 25 }, (_, i) => ({ uid: 2000 - page * 25 - i, subject: i === 0 ? 'Benvenuto in Oakstone Thirteen' : `Messaggio di prova ${i + 1} con un oggetto un po\u2019 lungo per vedere come va a capo su schermo piccolo`, from: i % 3 ? 'Mario Rossi <mario@esempio.it>' : 'Business Identity <support@businessidentity.llc>', date: new Date(Date.now() - (page * 25 + i) * 3600e3 * 7).toISOString(), seen: i % 4 === 0, size: 4000 }));
            return json({ folder: 'INBOX', page, total: 61, messages: msgs, hasMore: page < 2 });
        }
        if (/\/inbox\/messages\/\d+$/.test(path)) {
            const imgs = u.indexOf('images=1') >= 0;
            return json({ uid: 2000, folder: 'INBOX', subject: 'Benvenuto in Oakstone Thirteen', from: ['Business Identity <support@businessidentity.llc>'], to: ['info@oakstonethirteen.com', 'socio@esempio.it'], cc: [], replyTo: 'Business Identity <support@businessidentity.llc>', messageId: '<abc123@businessidentity.llc>', references: [], date: new Date().toISOString(),
                html: '<h2>Benvenuto!</h2><p>La tua LLC è pronta. Ecco i documenti: <a href="https://esempio.it/doc" target="_blank" rel="noopener noreferrer nofollow">apri</a>.</p>' + (imgs ? '<p>[qui ci sarebbe un\u2019immagine remota]</p>' : '<p>[immagine bloccata]</p>'),
                text: '', imagesBlocked: !imgs, attachments: [{ filename: 'EIN-letter.pdf', size: 84000, contentType: 'application/pdf' }] });
        }
        if (method === 'POST' && /\/inbox\/send$/.test(path)) { window.__lastSend = JSON.parse(opts.body || '{}'); return json({ ok: true, savedToSent: true }); }
        if (method === 'POST' && /\/inbox\/messages\/\d+\/(seen|move|delete)$/.test(path)) { (window.__inboxCalls = window.__inboxCalls || []).push(path.split('/').slice(-1)[0] + ':' + (opts.body || '')); return json({ ok: true }); }
        if (/\/wise\/enabled$/.test(path)) return json({ enabled: params.get('nowise2') !== '1' });
        // Compensi personali (prelievi che contano): date in ottobre solo per vederli in anteprima.
        if (/\/withdrawals$/.test(path)) {
            return json({ start_month: '2026-11', items: [
                { date: dayOffset(-2).slice(0, 10), transfer_id: '12', name: 'Assistente – conto Revolut', amount_eur: 1500, share: 1, counted_eur: 1500 },
                { date: dayOffset(-9).slice(0, 10), transfer_id: '11', name: 'Affitto', amount_eur: 800, share: 0.5, counted_eur: 400 }
            ] });
        }
        // Pagamenti (Wise): ?nowise=1 mostra la pagina non collegata, ?wiseerr=1 l'errore.
        if (/\/wise$/.test(path)) {
            if (params.get('wiseerr') === '1') return Promise.resolve(new Response(JSON.stringify({ error: 'Wise non riconosce il token: è sbagliato, scaduto o cancellato.' }), { status: 502, headers: { 'Content-Type': 'application/json' } }));
            return json(params.get('nowise') === '1' ? { configured: false } : params.get('nowise2') === '1' ? { configured: false, otherCompany: true } : wiseMock);
        }
        // Invio con PIN: il PIN giusto nell'anteprima è 0000 (?pinlock=1 simula troppi tentativi).
        if (method === 'POST' && /\/wise\/payments(\/\d+\/send)?$/.test(path)) {
            const b = JSON.parse((opts && opts.body) || '{}');
            const wants = /\/send$/.test(path) || b.send === true;
            const fail = (status, error) => Promise.resolve(new Response(JSON.stringify({ error }), { status, headers: { 'Content-Type': 'application/json' } }));
            if (wants && params.get('pinlock') === '1') return fail(429, 'Troppi PIN sbagliati: l\'invio è fermo, riprova tra 15 minuti.');
            if (wants && String(b.pin) !== '0000') return fail(400, 'PIN sbagliato.');
            if (wants && params.get('wisefail') === '1') return fail(422, 'Il saldo Wise non basta per questo bonifico. Il bonifico è stato preparato ma non è partito: lo trovi in lista, puoi riprovare con il PIN o confermarlo dall\'app di Wise.');
            return json({ id: 777, ok: true });
        }
        if (/\/wise\/quote$/.test(path)) {
            const b = JSON.parse((opts && opts.body) || '{}');
            const usd = b.sourceCurrency === 'USD';
            return json({ id: 'q-1', sourceCurrency: b.sourceCurrency, sourceAmount: Math.round(b.amount * (usd ? 109 : 100) + 62) / 100, targetCurrency: 'EUR', targetAmount: b.amount, fee: 0.62, rate: usd ? 0.92 : 1, delivery: null });
        }
        // Email: ?nomail=1 mostra la casella non collegata.
        if (/\/email$/.test(path)) return json(params.get('nomail') === '1' ? { configured: false, from: null, copyToOwner: false, sent: [] } : mailMock);
        // Logo dell'azienda: il file caricato diventa un data URL, come fa il server (che in più ripulisce gli SVG).
        const logoM = path.match(/^\/companies\/(\d+)\/logo$/);
        if (logoM) {
            const co = companies.find(c => String(c.id) === logoM[1]);
            const col = /kind=invoice/.test(u) ? 'logo_invoice' : 'logo';
            if (method === 'DELETE') { co[col] = null; return json(co); }
            const file = opts.body && opts.body.get && opts.body.get('file');
            return new Promise(res => {
                const r = new FileReader();
                r.onload = () => { co[col] = String(r.result).replace(/^data:[^;,]*/, /\.png$/i.test(file.name) ? 'data:image/png' : 'data:image/svg+xml'); res(json(co)); };
                r.readAsDataURL(file);
            });
        }
        if (method !== 'GET') return json({ id: 999, ok: true });
        if (path === '/companies') return json(noCompany ? [] : companies);
        const m = path.match(/^\/companies\/[^/]+\/([a-z-]+)$/);
        if (m && tables[m[1]]) return json(empty ? [] : tables[m[1]]);
        if (/\/receipts$/.test(path)) return json([{ id: 1, filename: 'ricevuta-volo.pdf', size_bytes: 184320 }, { id: 2, filename: 'carta-imbarco.png', size_bytes: 92160 }]);
        return json([]);
    };

    // Il token finto vive solo finché la pagina è aperta.
    localStorage.setItem('token', 'preview');
    localStorage.setItem('currentCompanyId', '1');
    window.addEventListener('pagehide', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentCompanyId');
    });

    // Stato iniziale da indirizzo: ?s=invoices, ?modal=invoice, ?confirm=1, ?toast=1
    document.addEventListener('DOMContentLoaded', () => setTimeout(() => {
        const s = params.get('s');
        if (s) {
            const btn = [...document.querySelectorAll('.sidebar-nav-item')].find(b => (b.getAttribute('onclick') || '').includes("'" + s + "'"));
            if (btn) showSection(s, btn);
        }
        const openers = {
            invoice: 'openInvoiceModal', expense: 'openExpenseModal', recurring: 'openRecurringModal',
            reminder: 'openReminderModal', note: 'openNoteModal', customer: 'openCustomerModal',
            company: 'openCompanyModal', refund: 'openExpenseNoteModal', settings: 'openCompanySettings',
            wiserecipient: 'openWiseRecipientModal', wiselabels: 'openWiseLabelsModal', wisesend: '__wisesend'
        };
        if (params.get('modal') === 'wisesend' && typeof window.openWiseSend === 'function') window.openWiseSend(3);
        const opener = openers[params.get('modal')];
        if (opener && typeof window[opener] === 'function') window[opener]();
        if (params.get('confirm') === '1') showConfirm('Questa azione non si può annullare.');
        if (params.get('toast') === '1') {
            showToast('Fattura salvata', 'success');
            showToast('Errore di rete', 'error');
            showToast('Seleziona un cliente', 'info');
        }
    }, 600));
})();
