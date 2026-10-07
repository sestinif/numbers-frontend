#!/usr/bin/env python3
"""Strumento di lavoro: mette, sostituisce o toglie una regola dentro una @media del blocco <style>.

Uso da Python:  from importlib import import_module  (oppure eseguito con exec)
  set_rule(css, 768, '.card', 'padding: 18px; border-radius: 12px;')  -> css
  drop_rule(css, 768, '.alert .btn') -> css
Le dichiarazioni si passano su una riga, separate da ';'.
"""
import re

M = ' ' * 8   # indentazione della @media
R = ' ' * 12  # indentazione delle regole dentro la @media

def _bounds(css, width):
    start = css.index(M + '@media (max-width: %dpx) {' % width)
    depth, k = 0, css.index('{', start)
    while True:
        if css[k] == '{': depth += 1
        elif css[k] == '}':
            depth -= 1
            if depth == 0: break
        k += 1
    return start, k   # k = posizione della graffa di chiusura della @media

def _find(css, width, selector):
    lo, hi = _bounds(css, width)
    pat = re.compile(r'^' + R + r'(?! )' + re.escape(selector).replace(r'\ ', r'\s+').replace(r',\s+', r',\s*') + r'\s*\{[^{}]*\}\n', re.M)
    return [m for m in pat.finditer(css, lo, hi)]

def _format(selector, decls):
    lines = [d.strip() for d in decls.split(';') if d.strip()]
    sel = (',\n' + R).join(s.strip() for s in selector.split(','))
    return R + sel + ' {\n' + ''.join(R + '    ' + l + ';\n' for l in lines) + R + '}\n'

def set_rule(css, width, selector, decls, comment=None):
    hits = _find(css, width, selector)
    text = _format(selector, decls)
    if comment: text = R + '/* ' + comment + ' */\n' + text
    if hits:
        assert len(hits) == 1, (selector, len(hits))
        m = hits[0]
        return css[:m.start()] + text + css[m.end():]
    lo, hi = _bounds(css, width)
    close = css.rfind('\n', lo, hi) + 1
    return css[:close] + '\n' + text + css[close:]

def drop_rule(css, width, selector):
    hits = _find(css, width, selector)
    assert len(hits) == 1, (selector, len(hits))
    m = hits[0]
    end = m.end() + (1 if css[m.end():m.end() + 1] == '\n' else 0)
    return css[:m.start()] + css[end:]
