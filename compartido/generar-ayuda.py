# Convierte los manuales (docs/manual-oficina.md y docs/manual-equipo.md) en la ayuda que se ve dentro
# de cada app (botón «?»). Uso: python3 compartido/generar-ayuda.py (después de cambiar un manual).
# Solo entiende lo que usan los manuales: ## y **títulos**, párrafos, listas, tablas, **negrita**, `código` y enlaces.
import html, re, pathlib
raiz = pathlib.Path(__file__).resolve().parent.parent

def enlinea(t):
    t = html.escape(t, quote=False)
    t = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t)
    t = re.sub(r'`(.+?)`', r'<code>\1</code>', t)
    return re.sub(r'\[(.+?)\]\((https?://[^)]+)\)', r'<a href="\2" target="_blank" rel="noopener">\1</a>', t)

def convertir(md):
    out, indice, lista, n = [], [], None, 0
    lineas = md.strip().split('\n')
    i = 0
    def cerrar():
        nonlocal lista
        if lista: out.append(f'</{lista}>'); lista = None
    while i < len(lineas):
        l = lineas[i]
        if l.startswith('## '):
            cerrar(); n += 1; titulo = l[3:].strip()
            indice.append(f'<a href="#ay{n}">{enlinea(titulo)}</a>')
            out.append(f'<h3 id="ay{n}">{enlinea(titulo)}</h3>')
        elif l.startswith('|'):
            cerrar(); filas = []
            while i < len(lineas) and lineas[i].startswith('|'):
                if not re.match(r'^\|[\s\-|]+\|$', lineas[i]): filas.append([c.strip() for c in lineas[i].strip('|').split('|')])
                i += 1
            i -= 1
            cab, *cuerpo = filas
            out.append('<div class="ay-tabla"><table><thead><tr>' + ''.join(f'<th>{enlinea(c)}</th>' for c in cab) + '</tr></thead><tbody>'
                       + ''.join('<tr>' + ''.join(f'<td>{enlinea(c)}</td>' for c in f) + '</tr>' for f in cuerpo) + '</tbody></table></div>')
        elif re.match(r'^\d+\. ', l) or l.startswith('- '):
            tipo = 'ol' if l[0].isdigit() else 'ul'
            if lista != tipo: cerrar(); out.append(f'<{tipo}>'); lista = tipo
            out.append('<li>' + enlinea(re.sub(r'^(\d+\.|-) ', '', l)) + '</li>')
        elif not l.strip():
            cerrar()
        else:
            cerrar(); out.append('<p>' + enlinea(l) + '</p>')
        i += 1
    cerrar()
    return '<nav class="ay-indice">' + ''.join(indice) + '</nav>' + '\n'.join(out)

for manual, destino in [('manual-oficina.md', 'gestion/src/ayuda.html'), ('manual-equipo.md', 'equipo/src/ayuda.html')]:
    (raiz / destino).write_text('<!-- Generado por compartido/generar-ayuda.py desde docs/' + manual + ': no editar a mano. -->\n'
                                + convertir((raiz / 'docs' / manual).read_text(encoding='utf8')) + '\n', encoding='utf8')
    print('ayuda creada:', destino)
