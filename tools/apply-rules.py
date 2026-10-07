#!/usr/bin/env python3
"""Strumento di lavoro del redesign: sostituisce regole CSS nel blocco <style> di index.html.

Uso: python3 tools/apply-rules.py <file con le regole nuove> [--dry]
Ogni regola del file (indentata a 8 spazi, fuori dalle @media) prende il posto della regola
con lo stesso selettore. Se il selettore non esiste, la regola viene aggiunta in fondo al
blocco «base», prima della prima @media. Tocca solo il blocco <style>.
"""
import re, sys

I = ' ' * 8

def split_rules(text):
    """Regole di primo livello: [(selettore, testo completo)]. Commenti e righe vuote scartati."""
    rules, i, n = [], 0, len(text)
    while i < n:
        m = re.compile(r'[ \t]*([^\s/{}][^{}]*?)\s*\{').match(text, i)
        if not m:
            j = text.find('\n', i)
            i = n if j < 0 else j + 1
            continue
        depth, k = 1, m.end()
        while depth and k < n:
            if text[k] == '{': depth += 1
            elif text[k] == '}': depth -= 1
            k += 1
        rules.append((re.sub(r'\s+', ' ', m.group(1).strip()), text[m.start():k].strip('\n')))
        i = k
    return rules

def find_rules(css, selector, lo, hi):
    """Posizioni (inizio, fine) delle regole di primo livello con quel selettore tra lo e hi."""
    out = []
    pat = re.compile(r'^' + I + r'(?! )' + re.escape(selector).replace(r'\ ', r'\s+').replace(r',\s+', r',\s*') + r'\s*\{', re.M)
    for m in pat.finditer(css, lo, hi):
        depth, k = 1, m.end()
        while depth:
            if css[k] == '{': depth += 1
            elif css[k] == '}': depth -= 1
            k += 1
        out.append((m.start(), k))
    return out

def main():
    dry = '--dry' in sys.argv
    new = split_rules(open(sys.argv[1], encoding='utf-8').read())
    s = open('index.html', encoding='utf-8').read()
    a, b = s.index('<style>'), s.index('</style>')
    css = s[a:b]
    for selector, text in new:
        media = css.index(I + '@media (max-width: 1024px)')
        hits = find_rules(css, selector, 0, media)
        body = '\n'.join(I + l.strip() if not l.startswith(I) else l for l in text.split('\n'))
        if not hits:
            print('  nuova   ', selector)
            # prima del commento che apre il blocco responsive
            anchor = css.rfind('\n', 0, css.rfind('/*', 0, media)) + 1
            css = css[:anchor] + body + '\n\n' + css[anchor:]
            continue
        print('  ' + ('sostituita' if len(hits) == 1 else 'DOPPIA x%d' % len(hits)), selector)
        start, end = hits[-1]
        css = css[:start] + body + css[end:]
        for st, en in reversed(hits[:-1]):
            tail = en + 1 if css[en:en + 1] == '\n' else en
            css = css[:st] + css[tail:]
    if not dry:
        open('index.html', 'w', encoding='utf-8').write(s[:a] + css + s[b:])

main()
