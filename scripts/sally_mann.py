"""Monta la app de Sally Mann · Macula et Materia en muestras/sally-mann/, pensada para visitarla
desde el móvil fuera de la sala.

Entradas (fuera del repositorio):
  --mann   carpeta con ars-mann-4.html (microapp) y ars-mann-historia.html (historia), más obra0X.jpg y retrato.jpg
  --guia   carpeta con las imágenes sacadas de la guía de sala (pdfimages -all -p guia.pdf g)

Salida: muestras/sally-mann/index.html (microapp) e historia.html (historia).
Los dos ficheros son autónomos: llevan las imágenes dentro y funcionan sin servidor.
Las imágenes de la guía son pequeñas (230–490 px): sirven para la maqueta, no para producción.
"""
import argparse, base64, colorsys, hashlib, io, json, os, sys
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument('--mann', required=True)
ap.add_argument('--guia', required=True)
ap.add_argument('--salida', default=os.path.join(os.path.dirname(__file__), '..', 'muestras', 'sally-mann'))
A = ap.parse_args()
os.makedirs(A.salida, exist_ok=True)

FOTO = '© Sally Mann, cortesía Gagosian'
def md5(b): return hashlib.md5(b).hexdigest()
def uri(b): return 'data:image/jpeg;base64,' + base64.b64encode(b).decode()
def jpeg(ruta, ancho=None, calidad=86):
    im = Image.open(ruta).convert('RGB')
    if ancho and im.width > ancho: im = im.resize((ancho, round(im.height * ancho / im.width)), Image.LANCZOS)
    out = io.BytesIO(); im.save(out, 'JPEG', quality=calidad, optimize=True, progressive=True)
    return out.getvalue()
def acentos(ruta, defecto):
    """Acento sacado de la imagen: el tono medio, claro para fondo oscuro y oscuro para fondo claro.
    Si la imagen es gris (sin tono que tomar), se queda el de la muestra."""
    im = Image.open(ruta).convert('RGB').resize((48, 48))
    r, g, b = (sum(c) / len(c) for c in zip(*im.getdata()))
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    if s < .08: return defecto
    s = min(max(s, .12), .3)
    hexa = lambda rgb: '#' + ''.join(f'{round(c * 255):02X}' for c in rgb)
    return hexa(colorsys.hls_to_rgb(h, .72, s)), hexa(colorsys.hls_to_rgb(h, .36, s))

# ---- obras de la guía que no estaban en la app ----
GUIA = {  # clave: (fichero, título, serie, técnica, año)
    'jessie-bites':   ('g-007-003.jpg', 'Jessie Bites', 'Immediate Family', 'Impresión en gelatina de plata, 50,8 × 61 cm', '1985'),
    'jessie-34':      ('g-009-005.jpg', 'Jessie #34', 'Faces', 'Impresión en gelatina de plata con barniz de diatomeas, 127 × 101,6 cm', '2004'),
    'autorretrato':   ('g-003-001.jpg', 'Sin título (Autorretrato #25)', 'Autorretratos', 'Positivo único de colodión húmedo sobre aluminio esmaltado, 6 ambrotipos de 38,1 × 34,3 cm', '2012'),
    'was-ever-love':  ('g-010-006.png', 'Was Ever Love', 'Proud Flesh', 'Impresión en gelatina de plata, 38,1 × 34,3 cm', '2009'),
    'cold-harbor':    ('g-011-007.jpg', 'Battlefields, Cold Harbor (Battle)', 'Battlefields', 'Impresión en gelatina de plata con barniz de tierra de diatomeas, 101,6 × 127 cm', '2003'),
    'ben-salem':      ('g-004-002.jpg', 'Virginia, sin título (Ben Salem)', 'Paisajes de Virginia', 'Impresión en gelatina de plata, 76,2 × 101,6 cm', '1993'),
    'swamp-bones':    ('g-012-008.jpg', 'Deep South, sin título (Swamp Bones)', 'Deep South', 'Impresión en gelatina de plata con tonos té, 101,6 × 127 cm', '1998'),
}
IMG = {k: jpeg(os.path.join(A.guia, v[0])) for k, v in GUIA.items()}

# ---- textos: cada frase señala algo que se ve en pantalla ----
TXT = {
    'jessie-bites': ['Jessie, tumbada entre cojines de rayas, con una boa de plumas. Nos mira seria. A su lado, el brazo de un adulto.',
                     'Busca en ese brazo la marca de los dientes. El título lo cuenta: Jessie muerde. En esta serie, los cuerpos de los niños son a la vez frágiles y poderosos.'],
    'jessie-34':    ['Jessie otra vez, casi veinte años después. Tan cerca que la cara no cabe: los ojos arriba, la boca abajo.',
                     'A la derecha, sobre la mejilla, baja una huella que no es de la piel: es la química de la placa. Mírala a los ojos: ¿te mira, o mira hacia dentro?'],
    'autorretrato': ['Después, Mann vuelve la cámara hacia sí misma. Seis placas, seis veces su propia cara.',
                     'En algunas, la química se come el rostro hasta dejar solo una mancha. Busca la placa en la que te mira.'],
    'was-ever-love': ['Larry, tumbado, con los ojos cerrados y la cabeza sobre una almohada acolchada.',
                      'No es una mirada clínica: la luz se posa en la frente, la nariz y la barba, como en una escultura. Por encima, la placa añade arañazos y velos, como si también la imagen envejeciera.'],
    'cold-harbor':  ['Cold Harbor, en Virginia: un campo de batalla de la Guerra de Secesión. Hoy, un bosque en calma.',
                     'Mira la superficie antes que el paisaje: las rayas blancas que cruzan los troncos, la esquina que se ennegrece arriba. Mann no muestra la batalla; deja que la placa la sugiera.'],
    'ben-salem':    ['Virginia, 1993. Un río, la otra orilla perdida en la niebla y unas ramas que entran por arriba.',
                     'Las esquinas se cierran en negro, como si miráramos a través de algo. Es su tierra: aquí lo íntimo y la historia del país van juntos.'],
    'swamp-bones':  ['Un pantano del Deep South. Troncos de ciprés y, a sus pies, raíces retorcidas: los huesos del título.',
                     'Todo flota en una niebla amarillenta, el tono del virado al té. Ni belleza sola ni violencia sola: en el sur de Mann, el paisaje nunca es neutro.'],
}

# ================= historia =================
h = open(os.path.join(A.mann, 'ars-mann-historia.html'), encoding='utf-8').read()
k = 'window.STORY_DATA='; i = h.index(k) + len(k)
D, fin = json.JSONDecoder().raw_decode(h, i)
fich = {n: md5(open(os.path.join(A.mann, f'{n}.jpg'), 'rb').read()) for n in ('obra01', 'obra02', 'obra03', 'obra04', 'retrato')}
SRC = {}
for b in D['blocks']:
    src = (b.get('media') or {}).get('src')
    if src:
        hh = md5(base64.b64decode(src.split(',', 1)[1]))
        for n, hf in fich.items():
            if hh == hf: SRC[n] = src
if set(fich) - set(SRC): sys.exit(f'faltan en la historia: {set(fich) - set(SRC)}')

def cap(*t): return [{'text': x} for x in t]
def ficha(titulo, serie, tecnica):
    return {'title': titulo, 'fields': [{'name': 'Serie', 'value': serie}, {'name': 'Técnica', 'value': tecnica}, {'name': 'Fotografía', 'value': FOTO}]}
def obra(src, captions, info, zoom=True):
    return {'fit': 'wide', 'media': {'type': 'image', 'tag': '', 'src': src}, 'captions': captions,
            'zoomable': zoom, 'pIn': False, 'pOut': False, 'pieceInfo': info}
def de_guia(clave):  # imagen pequeña: sin lupa hasta tener el original
    f, t, serie, tec, anno = GUIA[clave]
    return obra(uri(IMG[clave]), cap(*TXT[clave]), ficha(f'{t}, {anno}', serie, tec), zoom=False)
def capitulo(kicker, titulo, tema, captions):
    return {'type': 'capitulo', 'capitulo': {'kicker': kicker, 'titulo': titulo, 'tema': tema}, 'captions': captions}

D['blocks'] = [
    {'fit': 'wide', 'media': {'type': 'image', 'tag': '', 'src': SRC['retrato']}, 'zoomable': False, 'pIn': False, 'pOut': False,
     'captions': cap('Sally Mann nació en Lexington, Virginia, en 1951, y allí sigue viviendo y trabajando. Es autodidacta.',
                     'Trabaja con cámaras de gran formato, que obligan a ir despacio, y con procedimientos del siglo XIX. Las veladuras, los derrames y las manchas no se corrigen: forman parte de lo que la obra dice.',
                     'La exposición recorre cinco décadas de trabajo, desde At Twelve, empezada en 1983, hasta Goshen, de 2025. Esta historia la sigue en seis capítulos.')},
    capitulo('1984–1994', 'Immediate Family', 'Infancia y temporalidad',
             cap('Durante diez años, Mann fotografió a sus tres hijos, Emmett, Jessie y Virginia, en la finca familiar de Virginia.')),
    obra(SRC['obra02'], cap('Aquí están los tres, de frente, sosteniendo la mirada. La exposición larga del gran formato obliga a quedarse quietos, y esa quietud les da un aire de retrato antiguo más que de foto de familia.'),
         ficha('Emmett, Jessie and Virginia, 1989', 'Immediate Family', 'Impresión en gelatina de plata, 50,8 × 61 cm')),
    de_guia('jessie-bites'),
    obra(SRC['obra04'], cap('Tres niños sentados en la hierba, de espaldas, con un vaso, una manta y una cesta. Al fondo, el fuego ocupa medio horizonte.',
                            'Nada es casual. Mann componía estas escenas con cuidado, a menudo con ecos de la pintura clásica, y los propios niños participaban en construirlas.'),
         ficha('Immediate Family, sin título', 'Immediate Family', 'Impresión en gelatina de plata, 1984–1994')),
    obra(SRC['obra03'], cap('Unas manos adultas sostienen la cabeza y el brazo de una criatura con los ojos cerrados.',
                            'En la serie apenas hay objetos modernos ni detalles de época. Busca algo que permita fecharla: apenas una correa en la muñeca del adulto. Sin eso, la infancia deja de ser una época y se vuelve un territorio.'),
         ficha('Immediate Family, sin título', 'Immediate Family', 'Impresión en gelatina de plata, 1984–1994')),
    capitulo('2004', 'Faces', 'Retrato y finitud',
             cap('Los mismos hijos, años después. Ahora solo el rostro, encuadrado muy cerca y con una luz suave.')),
    de_guia('jessie-34'),
    de_guia('autorretrato'),
    capitulo('2006–2015', 'Proud Flesh', 'Cuerpo y enfermedad',
             cap('Mann fotografía a su marido, Larry, mientras avanza una enfermedad muscular degenerativa.')),
    de_guia('was-ever-love'),
    capitulo('Colodión húmedo', 'Materia', 'La materialidad como pensamiento',
             cap('Manchas, residuos químicos, veladuras. En la obra de Mann no son defectos que haya que corregir: son parte de lo que dice.')),
    de_guia('cold-harbor'),
    capitulo('1992–1998', 'El sur', 'La influencia del sur',
             cap('Desde los noventa, Mann fotografía Virginia, Georgia y el Deep South: lugares marcados por la Guerra de Secesión, la esclavitud y la segregación.')),
    de_guia('ben-salem'),
    obra(SRC['obra01'], cap('Misisipi, 1998: el río Tallahatchie. No hay nadie: la historia habita el paisaje sin necesidad de aparecer en él.',
                            'Mírala despacio. Al fondo, un puente de hierro; abajo, el cielo vuelto del revés en el agua. El virado al té y los defectos del negativo la acercan a un documento del siglo XIX.'),
         ficha('Deep South, Untitled (Bridge on Tallahatchie), 1998', 'Deep South', 'Copia a la gelatina de plata virada al té')),
    de_guia('swamp-bones'),
    capitulo('2025', 'Goshen', 'El grado cero del color',
             cap('Lo más reciente: lugares abandonados, y el color llevado hasta casi apagarse.',
                 'La imagen se va disolviendo hacia un blanco apenas teñido. Del color queda solo un rastro.',
                 'Retratos, paisajes y cuerpo no son compartimentos separados. Son una sola pregunta: ¿cómo grabar el tiempo en una superficie fija?')),
]
D['credits']['links'] = [{'texto': 'Ver el catálogo', 'href': 'index.html#catalogo'}, {'texto': 'Volver al menú de la muestra', 'href': 'index.html#hub'}]
D['config']['volver'] = 'index.html#hub'
h = h[:i] + json.dumps(D, ensure_ascii=False) + h[fin:]
# sin lupa, la ficha ocupa su sitio en la esquina
if h.count('.es-capitulo .pi-btn{right:var(--margen)}') != 1: sys.exit('no encuentro la regla de la ficha')
h = h.replace('.es-capitulo .pi-btn{right:var(--margen)}', '.es-capitulo .pi-btn,.state:not([data-zoom-src]) .pi-btn{right:var(--margen)}')
open(os.path.join(A.salida, 'historia.html'), 'w', encoding='utf-8').write(h)

# ================= microapp =================
m = open(os.path.join(A.mann, 'ars-mann-4.html'), encoding='utf-8').read()
k = 'const DATASET = '; i = m.index(k) + len(k)
M, fin = json.JSONDecoder().raw_decode(m, i)
nums = [o['num'] for o in M['obras']]
orden = ['jessie-bites', 'jessie-34', 'autorretrato', 'was-ever-love', 'cold-harbor', 'ben-salem', 'swamp-bones']
for n, clave in enumerate(orden, start=len(nums) + 1):
    f, t, serie, tec, anno = GUIA[clave]
    ac, acc = acentos(os.path.join(A.guia, f), (M['muestra']['acento'], M['muestra']['acentoClaro']))
    M['obras'].append({'num': f'{n:02d}', 'titulo': t, 'artista': 'mann', 'tecnica': f'{tec}, {anno}', 'venta': '',
                       'texto': ' '.join(TXT[clave]), 'audio': '', 'sala': None,
                       'mini': uri(jpeg(os.path.join(A.guia, f), ancho=360, calidad=80)), 'grande': uri(IMG[clave]),
                       'acento': ac, 'acentoClaro': acc})
m = m[:i] + json.dumps(M, ensure_ascii=False) + m[fin:]

def una(viejo, nuevo):
    global m
    if m.count(viejo) != 1: sys.exit(f'no encuentro una sola vez: {viejo[:60]}')
    m = m.replace(viejo, nuevo)
# fuera de la sala primero: lo que sirve en casa arriba, lo de la sala al final
una("""    ['#obra/01','Recorrido en sala'],
    ['#catalogo','Catálogo'],
    D.artistas.length > 1 ? ['#artistas','Artistas'] : ['#artista/'+D.artistas[0].id, D.artistas[0].nombre],
    ['#muestra','Sobre la muestra'],
    ['#plano','Mapa']""",
"""    ['#catalogo','Catálogo'],
    D.artistas.length > 1 ? ['#artistas','Artistas'] : ['#artista/'+D.artistas[0].id, D.artistas[0].nombre],
    ['#muestra','Sobre la muestra'],
    ['#obra/01','Recorrido en sala'],
    ['#plano','Mapa']""")
una('href="ars-mann-historia.html"', 'href="historia.html"')
open(os.path.join(A.salida, 'index.html'), 'w', encoding='utf-8').write(m)

print('historia:', len(D['blocks']), 'bloques |', round(len(h) / 1024), 'KB')
print('microapp:', len(M['obras']), 'obras |', round(len(m) / 1024), 'KB')
