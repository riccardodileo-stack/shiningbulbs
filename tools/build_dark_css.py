"""Genera dark.css a partire da style.css.
Uso (dalla cartella del gestionale):  python3 tools/build_dark_css.py
Ogni regola di style.css che contiene colori viene ripetuta sotto html[data-theme=dark],
con i colori trasformati in base alla proprietà (sfondo, bordo, testo, ombra).
Le rifiniture manuali stanno in fondo a dark.css, dopo il marcatore MANUALE: non vengono toccate."""
import colorsys, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / 'style.css', ROOT / 'dark.css'
P = 'html[data-theme=dark]'
MARK = '/* ===== MANUALE: rifiniture a mano (non generate) ===== */'

VARS = {'--bg': '#0e1014', '--surface': '#171a21', '--ink': '#e6e8ee', '--muted': '#8c94a4', '--line': '#262a33',
        '--blue': '#5b7cf0', '--blue-dark': '#4a6ae0', '--blue-soft': '#1b2340', '--green': '#55b896',
        '--shadow': '0 5px 24px #00000040'}
HEX = re.compile(r'#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b')
NAMED = re.compile(r'(?<![\w-])(white)(?![\w-])')

def parse(h):
    h = h.lstrip('#')
    if len(h) in (3, 4): h = ''.join(c * 2 for c in h)
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    a = h[6:8] if len(h) == 8 else ''
    return r, g, b, a

def fmt(r, g, b, a):
    return '#' + ''.join(f'{round(max(0, min(1, x)) * 255):02x}' for x in (r, g, b)) + a

COLOR_PROPS = {'color', 'fill', 'stroke', 'box-shadow', 'outline', 'outline-color', 'caret-color', 'accent-color'}

def kind_of(prop):
    if prop in ('color', 'fill', 'stroke', 'caret-color', 'accent-color', 'text-decoration-color', '-webkit-text-fill-color'): return 'text'
    if 'shadow' in prop: return 'shadow'
    if prop.startswith('border') or prop.startswith('outline'): return 'border'
    return 'surface'

def transform(hexstr, kind):
    r, g, b, a = parse(hexstr)
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    chroma = max(r, g, b) - min(r, g, b)
    if kind == 'shadow':
        alpha = int(a, 16) if a else 40
        return fmt(0, 0, 0, f'{min(255, alpha * 3 + 16):02x}')
    if kind == 'text':
        if l > 0.88: return fmt(r, g, b, a)                       # testo bianco su colore pieno
        if chroma > 0.2 and l < 0.75: l2, s2 = min(0.74, l + 0.14), s  # accenti: un po' più chiari
        else: l2, s2 = 0.95 - l * 0.6, s * 0.8                   # neutri: inversione morbida
    elif kind == 'border':
        if l <= 0.6: return fmt(r, g, b, a)
        l2, s2 = 0.16 + (0.97 - l) * 0.55, min(s, 0.35)
    else:  # surface
        if l <= 0.6: return fmt(r, g, b, a)                       # pieni/accenti restano
        if chroma > 0.045 and l > 0.85: l2, s2 = 0.15 + (1 - l) * 0.9, min(s, 0.38)   # tinte chiare -> tinte scure
        elif l >= 0.93: l2, s2 = 0.07 + (l - 0.93) / 0.07 * 0.05, min(s, 0.18) # bianchi/grigi chiarissimi
        else: l2, s2 = 0.15 + (0.93 - l) * 0.45, min(s, 0.3)
    if s2 < 0.12 and kind != 'text': h, s2 = 0.62, 0.14   # neutri: leggera tinta blu-grigia, come l'interfaccia chiara
    r2, g2, b2 = colorsys.hls_to_rgb(h, max(0, min(1, l2)), max(0, min(1, s2)))
    return fmt(r2, g2, b2, a)

def convert_decls(body):
    out = []
    for decl in re.split(r';(?![^()]*\))', body):
        if ':' not in decl: continue
        prop, val = decl.split(':', 1); prop = prop.strip().lower()
        if prop.startswith('--'):
            if prop in VARS: out.append(f'{prop}:{VARS[prop]}')
            elif HEX.search(val): out.append(f'{prop}:' + HEX.sub(lambda m: transform(m.group(0), 'surface'), val))
            continue
        if not (HEX.search(val) or NAMED.search(val)):
            # Ripete anche le dichiarazioni senza colori esadecimali (es. border:0, background:transparent,
            # var(--blue)): così l'ordine di precedenza tra le regole resta quello del tema chiaro.
            if (prop in COLOR_PROPS or prop.startswith('background') or (prop.startswith('border') and prop not in ('border-radius', 'border-collapse', 'border-spacing') and 'radius' not in prop)): out.append(f'{prop}:{val.strip()}')
            continue
        k = kind_of(prop)
        v = NAMED.sub('#ffffff', val)
        v = HEX.sub(lambda m: transform(m.group(0), k), v)
        out.append(f'{prop}:{v.strip()}')
    return ';'.join(out)

def prefix(sel):
    parts = []
    for s in re.split(r',(?![^()]*\))', sel):
        s = s.strip()
        if s in (':root', 'html'): parts.append(P)
        elif s.startswith('html'): parts.append(P + s[4:])
        else: parts.append(f'{P} {s}')
    return ','.join(parts)

def walk(css):
    out, i, n = [], 0, len(css)
    while i < n:
        j = css.find('{', i)
        if j < 0: break
        head = css[i:j].strip()
        head = re.sub(r'/\*.*?\*/', '', head, flags=re.S).strip()
        if ';' in head: head = head.rsplit(';', 1)[1].strip()   # es. @charset "UTF-8"; prima della regola
        depth, k = 1, j + 1
        while depth and k < n:
            depth += {'{': 1, '}': -1}.get(css[k], 0); k += 1
        inner = css[j + 1:k - 1]
        if head.startswith('@media') or head.startswith('@supports'):
            sub = walk(inner)
            if sub: out.append(f'{head}{{{sub}}}')
        elif head.startswith('@'):
            pass  # keyframes ecc.
        else:
            decls = convert_decls(inner)
            if decls: out.append(f'{prefix(head)}{{{decls}}}')
        i = k
    return '\n'.join(out)

css = re.sub(r'/\*.*?\*/', '', SRC.read_text(encoding='utf-8'), flags=re.S)
generated = walk(css)
manual = ''
if OUT.exists():
    old = OUT.read_text(encoding='utf-8')
    if MARK in old: manual = old.split(MARK, 1)[1]
header = f'/* dark.css — GENERATO da tools/build_dark_css.py a partire da style.css. */\n{P}{{color-scheme:dark}}\n'
OUT.write_text(header + generated + '\n\n' + MARK + (manual if manual else '\n'), encoding='utf-8')
print('dark.css:', len(generated.splitlines()), 'regole')
