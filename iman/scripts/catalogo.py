#!/usr/bin/env python3
"""Rehace el catálogo de un personaje del imán a partir de los datos del repositorio.

Uso:  python3 iman/scripts/catalogo.py van-gogh

Lee  iman/personajes/<id>/obras.json  (lo que se escribe a mano: obras propias, «Para empezar»,
títulos en castellano y alias) y le añade, desde el repositorio:
  - catalogo:     las obras con imagen de data/artistas/<id>.json, con su visita en primera persona
                  si está en unidad/obras/breves.json («autor»)
  - epocas, selecciones: de artistas/<id>.json
  - img, th, iw, ih: las rutas de img/ (o la que diga la obra propia) y el tamaño real de la imagen
Las rutas van relativas a la raíz del repositorio; el motor les pone delante lo que haga falta.
"""
import json, os, re, sys
from PIL import Image

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
TIPO = {'Painting': 'Pintura', 'Drawing and Watercolor': 'Dibujo y acuarela', 'Drawing': 'Dibujo', 'Print': 'Grabado'}
MUSEO = {'aic': 'Art Institute of Chicago', 'cma': 'Cleveland Museum of Art'}
FECHA = [('c. ', 'h. '), ('Early ', 'Principios de '), ('March ', 'Marzo de '), ('July ', 'Julio de ')]

def tam(ruta):
    with Image.open(os.path.join(RAIZ, ruta)) as im: return im.size

def main(pid):
    f = os.path.join(RAIZ, 'iman', 'personajes', pid, 'obras.json')
    O = json.load(open(f))
    tit, alias = O.get('titulos', {}), O.get('alias', {})
    cat = json.load(open(os.path.join(RAIZ, 'data', 'artistas', pid + '.json')))['obras']
    art = json.load(open(os.path.join(RAIZ, 'artistas', pid + '.json')))
    brev = json.load(open(os.path.join(RAIZ, 'unidad', 'obras', 'breves.json')))['obras']
    # Obras propias: su imagen sale de img/ (imgKey) o de la ruta que traigan
    for k, o in O.get('propias', {}).items():
        if o.get('imgKey'):
            o['img'], o['th'] = f"img/{o['imgKey']}-1600.jpg", f"img/{o['imgKey']}-400.jpg"
        o['th'] = o.get('th') or o['img']
        o['iw'], o['ih'] = tam(o['img'])
    lista = []
    for c in cat:
        k = c['key']
        if k in alias or not os.path.exists(os.path.join(RAIZ, 'img', k + '-1600.jpg')): continue
        m = re.search(r'(1[89]\d\d)', c.get('fecha') or '')
        fecha = c.get('fecha') or str(c['año'])
        for a, b in FECHA: fecha = fecha.replace(a, b)
        e = {'k': k, 'titulo': tit.get(k, c['titulo']), 'fecha': fecha, 'año': int(m.group(1)) if m else c['año'],
             'museo': MUSEO[k[:3]], 'tipo': TIPO.get(c.get('tipo'), c.get('tipo')),
             'img': f'img/{k}-1600.jpg', 'th': f'img/{k}-400.jpg'}
        e['iw'], e['ih'] = tam(e['img'])
        b = brev.get(k)
        if b and b.get('autor'):
            e['visita'] = [p for p in b['autor'] if p.get('k') != 'pregunta']
            pq = [p['t'] for p in b['autor'] if p.get('k') == 'pregunta']
            e['mira'] = pq[0] if pq else None
            e['citas'] = b.get('citas', {})
            e['fuente'] = b.get('fuente')
        lista.append(e)
    O['catalogo'] = lista
    con = {x['k'] for x in lista} | set(O.get('propias', {}))
    O['epocas'] = [{'titulo': e['titulo'], 'hasta': e['hasta'], 'dice': e['dice']} for e in art['epocas']]
    O['selecciones'] = [{'id': s['id'], 'titulo': s['titulo'], 'dice': s['dice'], 'obras': [alias.get(x, x) for x in s['obras'] if alias.get(x, x) in con]} for s in art['selecciones']]
    json.dump(O, open(f, 'w'), ensure_ascii=False, indent=1)
    print(pid, len(lista), 'obras del catálogo +', len(O.get('propias', {})), 'propias ·', sum(1 for x in lista if x.get('visita')), 'con visita')

if __name__ == '__main__':
    main(sys.argv[1])
