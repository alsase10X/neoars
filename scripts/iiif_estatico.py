"""IIIF estático (nivel 0) a partir de una imagen: genera info.json y las teselas
con las mismas rutas que pide la unidad, para servirlas desde GitHub Pages sin servidor.
Uso: python scripts/iiif_estatico.py imagen.jpg unidad/iiif/<id> https://<usuario>.github.io/neoars/unidad/iiif/<id>
"""
import json, math, os, sys
from PIL import Image

src, out, ident = sys.argv[1], sys.argv[2], sys.argv[3]
T = 512
im = Image.open(src).convert('RGB')
W, H = im.size
sfs = [1]
while max(W, H) / sfs[-1] > T:
    sfs.append(sfs[-1] * 2)

def guardar(img, ruta):
    os.makedirs(os.path.dirname(ruta), exist_ok=True)
    img.save(ruta, 'JPEG', quality=84, optimize=True, progressive=True)

for sf in sfs:
    t = T * sf
    for y in range(0, H, t):
        for x in range(0, W, t):
            w, h = min(t, W - x), min(t, H - y)
            tw = math.ceil(w / sf)
            th = round(h * tw / w)
            guardar(im.crop((x, y, x + w, y + h)).resize((tw, th), Image.LANCZOS),
                    f'{out}/{x},{y},{w},{h}/{tw},/0/default.jpg')
# Vistas completas: base para la pantalla y miniatura para el fondo difuminado
for w in (96, 1200):
    guardar(im.resize((w, round(H * w / W)), Image.LANCZOS), f'{out}/full/{w},/0/default.jpg')

json.dump({'@context': 'http://iiif.io/api/image/2/context.json', '@id': ident,
           'protocol': 'http://iiif.io/api/image', 'width': W, 'height': H,
           'profile': ['http://iiif.io/api/image/2/level0.json'],
           'sizes': [{'width': 96, 'height': round(H * 96 / W)}, {'width': 1200, 'height': round(H * 1200 / W)}],
           'tiles': [{'width': T, 'scaleFactors': sfs}]},
          open(f'{out}/info.json', 'w'), indent=1)
print(W, H, 'factores', sfs)
