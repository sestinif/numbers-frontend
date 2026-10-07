// Numbers — controlli del redesign.
//   node tools/audit.mjs            prova che la logica è intatta rispetto a main, stampa i conteggi di stile
//   node tools/audit.mjs --diff     stampa anche il diff completo dello script principale
//   node tools/audit.mjs --strict   fallisce se resta anche un solo residuo di stile
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const base = args.find(a => !a.startsWith('--')) || 'main';
const root = new URL('../', import.meta.url);
const now = f => readFileSync(new URL(f, root), 'utf8');
const old = f => execFileSync('git', ['show', `${base}:${f}`], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const sha = s => createHash('sha256').update(s).digest('hex').slice(0, 16);
const count = (s, re) => (s.match(re) || []).length;

function pdfRegion(html) {
    const a = html.indexOf('function generatePDF(');
    const b = html.indexOf('function setupExpenseDate(');
    if (a < 0 || b < a) throw new Error('generatore PDF non trovato');
    return html.slice(a, b);
}
function mainScript(html) {
    const a = html.indexOf('<script>', html.indexOf('notes-logic.js'));
    const b = html.lastIndexOf('</script>');
    if (a < 0 || b < a) throw new Error('script principale non trovato');
    return html.slice(a, b);
}
const sorted = (html, re) => [...html.matchAll(re)].map(m => m[1]).sort();
const same = (x, y) => x.length === y.length && x.every((v, i) => v === y[i]);
const only = (x, y) => x.filter(v => !y.includes(v));

const cur = now('index.html'), was = old('index.html');
let ok = true;
const check = (label, pass, detail) => { if (!pass) ok = false; console.log((pass ? 'ok   ' : 'ROTTO') + ' ' + label + (pass || !detail ? '' : '\n      ' + detail)); };

check('generatore PDF identico (' + sha(pdfRegion(was)) + ')', sha(pdfRegion(cur)) === sha(pdfRegion(was)));
const onNow = sorted(cur, /onclick="([^"]*)"/g), onWas = sorted(was, /onclick="([^"]*)"/g);
check('attributi onclick identici (' + onWas.length + ')', same(onNow, onWas), 'tolti: ' + JSON.stringify(only(onWas, onNow)) + ' · aggiunti: ' + JSON.stringify(only(onNow, onWas)));
const idNow = sorted(cur, /\sid="([^"$]+)"/g), idWas = sorted(was, /\sid="([^"$]+)"/g);
check('id identici (' + idWas.length + ')', same(idNow, idWas), 'tolti: ' + JSON.stringify(only(idWas, idNow)) + ' · aggiunti: ' + JSON.stringify(only(idNow, idWas)));
const fnNow = sorted(mainScript(cur), /function\s+([A-Za-z0-9_]+)\s*\(/g), fnWas = sorted(mainScript(was), /function\s+([A-Za-z0-9_]+)\s*\(/g);
check('funzioni identiche (' + fnWas.length + ')', same(fnNow, fnWas), 'tolte: ' + JSON.stringify(only(fnWas, fnNow)) + ' · aggiunte: ' + JSON.stringify(only(fnNow, fnWas)));

const dir = mkdtempSync(join(tmpdir(), 'numbers-audit-'));
writeFileSync(join(dir, 'prima.js'), mainScript(was));
writeFileSync(join(dir, 'dopo.js'), mainScript(cur));
const diff = spawnSync('git', ['diff', '--no-index', '--unified=0', join(dir, 'prima.js'), join(dir, 'dopo.js')], { encoding: 'utf8' }).stdout || '';
const changed = diff.split('\n').filter(l => /^[+-](?![+-])/.test(l));
console.log('\nScript principale: ' + changed.length + ' righe cambiate rispetto a ' + base + (changed.length ? ' (devono stare tutte tra le righe ammesse del task)' : ''));
console.log(args.includes('--diff') ? diff : changed.map(l => '  ' + l.slice(0, 160)).join('\n'));

// Residui di stile: tutto tranne il generatore PDF.
const files = ['index.html', 'auth-shared.css', 'auth.html', 'forgot-password.html', 'reset-password.html'];
const residue = {};
for (const f of files) {
    let s = now(f);
    if (f === 'index.html') s = s.replace(pdfRegion(s), '');
    const add = (k, n) => { residue[k] = (residue[k] || 0) + n; };
    add('testi sotto 12px', [...s.matchAll(/font-size:\s*([\d.]+)px/g)].filter(m => +m[1] < 12).length + [...s.matchAll(/\bsize:\s*(\d+)\s*[,}]/g)].filter(m => +m[1] < 12).length);
    add('maiuscole forzate', count(s, /text-transform:\s*uppercase/g));
    add('spaziature larghe', [...s.matchAll(/letter-spacing:\s*(-?[\d.]+)px/g)].filter(m => +m[1] > 0).length);
    add('sfumature', count(s, /(linear|radial)-gradient|createLinearGradient/g));
    add('sfocature', count(s, /backdrop-filter/g));
    add('verde scritto a mano', count(s, /0,\s*210,\s*106|#00D26A|#00BD5F|#00E074|#00C964/gi));
    add('Space Grotesk', count(s, /Space[ +]Grotesk/g));
    add('pesi da 600 in su', [...s.matchAll(/font-weight:\s*(\d+)|weight:\s*'(\d+)'/g)].filter(m => +(m[1] || m[2]) >= 600).length + count(s, /font-weight:\s*bold|fontWeight\s*=\s*'bold'/g));
}
console.log('\nResidui di stile:');
for (const [k, v] of Object.entries(residue)) console.log('  ' + String(v).padStart(3) + '  ' + k);
const dirty = Object.values(residue).some(v => v > 0);

console.log('\nLOGICA: ' + (ok ? 'ok' : 'ROTTA'));
if (args.includes('--strict')) console.log('STILE: ' + (dirty ? 'restano residui' : 'pulito'));
process.exit(!ok || (args.includes('--strict') && dirty) ? 1 : 0);
