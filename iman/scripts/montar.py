#!/usr/bin/env python3
"""Monta el imán.

  python3 iman/scripts/montar.py repo
      Rehace iman/index.html a partir de motor/cuerpo.html. Esa página lee los JSON al cargar
      (?p=<personaje>&e=<exposición>) y sirve tal cual en GitHub Pages.

  python3 iman/scripts/montar.py claude <salida.html> [--arte-ref <carpeta> --pj <id>]
      Una sola página con el motor, los estilos y los datos de la exposición incrustados, para
      publicarla como artefacto de Claude. Escribe al lado <salida>.archivos.json con las imágenes
      que hay que publicar junto a ella (rutas del repositorio). Con --arte-ref, el personaje --pj
      usa la ilustración de esa carpeta (avatar.jpg y linea.webp) en vez de la suya del repositorio.
"""
import json, os, shutil, sys

IMAN = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
RAIZ = os.path.dirname(IMAN)
MOTOR = ['datos.js', 'retrato.js', 'logica.js', 'prompt.js']
CABEZA = '''<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,500&display=swap" rel="stylesheet">
'''
leer = lambda *p: open(os.path.join(IMAN, *p), encoding='utf-8').read()

def repo():
    html = '<!DOCTYPE html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n' + CABEZA + '<title>Imán · artmedium</title>\n<link rel="stylesheet" href="motor/estilos.css">\n</head>\n<body>\n'
    html += leer('motor', 'cuerpo.html') + '\n<script src="motor/cargar.js"></script>\n</body>\n</html>\n'
    open(os.path.join(IMAN, 'index.html'), 'w', encoding='utf-8').write(html)
    print('iman/index.html')

def claude(salida, arte_ref=None, pj=None, expo_id='vincent-y-monet'):
    expo = json.loads(leer('exposiciones', expo_id + '.json'))
    pers, archivos = {}, set()
    for p in expo['personajes']:
        ficha, obras = json.loads(leer('personajes', p['id'], 'ficha.json')), json.loads(leer('personajes', p['id'], 'obras.json'))
        if arte_ref and p['id'] == pj:
            ficha['arte'] = {'completo': 'arte-ref/avatar.jpg', 'linea': 'arte-ref/linea.webp',
                             'lineaEncuadre': {'ratio': '1/1', 'ancho': 'min(230vw,1000px)', 'arriba': '84px', 'x': '-47%', 'opacidad': '.72'}}
            p['avatar'] = f"personajes/{p['id']}/arte-ref/avatar.jpg"; p.pop('recorte', None)
        for o in list(obras.get('propias', {}).values()) + obras.get('catalogo', []):
            archivos.add(o['img']); archivos.add(o.get('th') or o['img'])
        for v in (ficha.get('arte') or {}).values():
            if isinstance(v, str): archivos.add(f"iman/personajes/{p['id']}/{v}")
        pers[p['id']] = {'ficha': ficha, 'obras': obras}
    datos = {'modo': 'claude', 'raiz': '', 'iman': 'iman/', 'exposicion': expo, 'personajes': pers}
    elegir = ("(()=>{const D=window.DATOS,h=location.hash.slice(1).split('.')[0];let s=null;try{s=sessionStorage.getItem('am.iman.pj')}catch(e){}"
              "D.activo=D.personajes[h]?h:D.personajes[s]?s:D.exposicion.personajes[0].id;})();")
    html = '<meta charset="utf-8">\n<title>Imán de Vincent</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n' + CABEZA
    html += '<style>\n' + leer('motor', 'estilos.css') + '\n</style>\n\n' + leer('motor', 'cuerpo.html')
    html += '\n<script>\nwindow.DATOS = ' + json.dumps(datos, ensure_ascii=False) + ';\n' + elegir + '\n</script>\n'
    html += '<script>\n' + '\n'.join(leer('motor', m) for m in MOTOR) + '\n</script>\n'
    open(salida, 'w', encoding='utf-8').write(html)
    # Las imágenes: las del repositorio con su ruta; la ilustración de referencia, desde su carpeta
    mapa = {}
    for a in sorted(archivos):
        if '/arte-ref/' in a: mapa[a] = os.path.join(arte_ref, os.path.basename(a))
        else: mapa[a] = os.path.join(RAIZ, a)
    json.dump(mapa, open(salida + '.archivos.json', 'w'), ensure_ascii=False, indent=1)
    print(salida, round(len(html)/1024), 'KB ·', len(mapa), 'archivos')

if __name__ == '__main__':
    a = sys.argv[1:]
    if not a or a[0] == 'repo': repo()
    else:
        opt = {a[i]: a[i + 1] for i in range(2, len(a) - 1, 2)}
        claude(a[1], opt.get('--arte-ref'), opt.get('--pj'))
