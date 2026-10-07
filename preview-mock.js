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
        expenses.push({ id: eid++, expense_date: monthDay(b, 1), description: 'Render', category: 'Software', amount: 19, auto_source: 'rule:1', notes: 'Spesa ricorrente' });
        expenses.push({ id: eid++, expense_date: monthDay(b, 1), description: 'Vercel Pro', category: 'Software', amount: 20, auto_source: 'rule:2', notes: 'Spesa ricorrente' });
        expenses.push({ id: eid++, expense_date: monthDay(b, 28), description: 'API OpenAI', category: 'Software', amount: 12.4 + b * 3.1, auto_source: 'openai', notes: 'Si aggiorna da sola' });
        expenses.push({ id: eid++, expense_date: monthDay(b, 12), description: 'Commercialista', category: 'Consulenze', amount: 350 });
        if (b % 2 === 0) expenses.push({ id: eid++, expense_date: monthDay(b, 17), description: 'Meta Ads — campagna lead generation di ottobre', category: 'Marketing', amount: 640 + b * 25 });
        if (b % 3 === 0) expenses.push({ id: eid++, expense_date: monthDay(b, 21), description: 'Volo Malta-Bologna', category: 'Rimborso fatturato', amount: 184.3 });
    }
    const liveExpenses = expenses.filter(e => e.expense_date <= iso(today));
    if (params.get('neg') === '1') liveExpenses.push({ id: eid++, expense_date: dayOffset(0), description: 'Acquisto attrezzatura', category: 'Ufficio', amount: 9800 });

    const recurring = [
        { id: 1, name: 'Render', category: 'Software', frequency: 'monthly', day_of_month: 1, start_period: period(13), end_period: null, amount: 19 },
        { id: 2, name: 'Vercel Pro', category: 'Software', frequency: 'monthly', day_of_month: 1, start_period: period(13), end_period: null, amount: 20 },
        { id: 3, name: 'Dominio scalingcatalyst.com', category: 'Software', frequency: 'yearly', day_of_month: 10, start_period: period(9), end_period: null, amount: 24 },
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
            company: 'openCompanyModal', refund: 'openExpenseNoteModal', settings: 'openCompanySettings'
        };
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
