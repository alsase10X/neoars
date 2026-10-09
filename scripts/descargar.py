#!/usr/bin/env python3
"""Descarga la ficha y la imagen de cada obra de recorridos.json para servirlas desde el repositorio.

Se ejecuta en GitHub Actions cada vez que cambia recorridos.json (ver .github/workflows/imagenes.yml).
Solo descarga lo que falta: las obras ya guardadas no se vuelven a pedir.

Deja:
  data/<clave>.json      ficha original del museo (la app la normaliza igual que la de la API)
  img/<clave>-400.jpg    miniatura
  img/<clave>-1600.jpg   imagen para el visor
  img/manifest.json      lista de obras con imagen propia (la app la lee al arrancar)
"""
import io
import json
import pathlib
import sys
import time

import requests
from PIL import Image

RAIZ = pathlib.Path(__file__).resolve().parent.parent
IMG = RAIZ / "img"
DATA = RAIZ / "data"
AGENTE = "neoars-explorador (https://github.com/alsase10X/neoars)"
CABECERAS = {"User-Agent": AGENTE, "AIC-User-Agent": AGENTE}
AIC_CAMPOS = (
    "id,title,artist_display,artist_title,date_display,date_start,place_of_origin,medium_display,"
    "dimensions,credit_line,department_title,classification_title,style_title,subject_titles,"
    "description,short_description,image_id,thumbnail,color,is_public_domain,main_reference_number"
)


def pedir_json(url):
    r = requests.get(url, headers=CABECERAS, timeout=60)
    r.raise_for_status()
    return r.json()


def pedir_imagen(url):
    r = requests.get(url, headers=CABECERAS, timeout=180)
    r.raise_for_status()
    return Image.open(io.BytesIO(r.content)).convert("RGB")


def guardar(im, ruta, ancho):
    if im.width > ancho:
        im = im.resize((ancho, round(im.height * ancho / im.width)), Image.LANCZOS)
    im.save(ruta, "JPEG", quality=82, optimize=True, progressive=True)


def ficha_e_imagenes(museo, ident):
    """Devuelve la ficha original y las URL de imagen, de mayor a menor."""
    if museo == "aic":
        j = pedir_json(f"https://api.artic.edu/api/v1/artworks/{ident}?fields={AIC_CAMPOS}")
        base = (j.get("config") or {}).get("iiif_url") or "https://www.artic.edu/iiif/2"
        a = j["data"]
        iiif = f"{base}/{a['image_id']}"
        return {"src": museo, "base": base, "raw": a}, [f"{iiif}/full/1686,/0/default.jpg", f"{iiif}/full/843,/0/default.jpg"]
    if museo == "met":
        o = pedir_json(f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{ident}")
        return {"src": museo, "raw": o}, [o.get("primaryImage"), o.get("primaryImageSmall")]
    if museo == "cma":
        a = pedir_json(f"https://openaccess-api.clevelandart.org/api/artworks/{ident}")["data"]
        im = a.get("images") or {}
        return {"src": museo, "raw": a}, [(im.get("print") or {}).get("url"), (im.get("web") or {}).get("url")]
    raise ValueError(f"Museo desconocido: {museo}")


def claves_de_recorridos():
    datos = json.loads((RAIZ / "recorridos.json").read_text("utf-8"))
    lista = datos["recorridos"] if isinstance(datos, dict) else datos
    return sorted({k for r in lista for k in r.get("obras", [])})


def main():
    IMG.mkdir(exist_ok=True)
    DATA.mkdir(exist_ok=True)
    listas, fallos = [], []
    for clave in claves_de_recorridos():
        museo, ident = clave.split("-", 1)
        ficha_ruta = DATA / f"{clave}.json"
        grande, pequena = IMG / f"{clave}-1600.jpg", IMG / f"{clave}-400.jpg"
        try:
            if not (ficha_ruta.exists() and grande.exists() and pequena.exists()):
                ficha, urls = ficha_e_imagenes(museo, ident)
                ficha_ruta.write_text(json.dumps(ficha, ensure_ascii=False), "utf-8")
                im = None
                for url in filter(None, urls):
                    try:
                        im = pedir_imagen(url)
                        break
                    except Exception as e:  # se prueba el siguiente tamaño
                        print(f"  {clave}: no se pudo descargar {url}: {e}")
                if im is None:
                    raise RuntimeError("ninguna imagen disponible")
                guardar(im, grande, 1600)
                guardar(im, pequena, 400)
                time.sleep(1)  # cortesía con las APIs de los museos
            listas.append(clave)
            print("ok", clave)
        except Exception as e:
            fallos.append(clave)
            print("FALLO", clave, e, file=sys.stderr)
    (IMG / "manifest.json").write_text(json.dumps({"obras": listas}, ensure_ascii=False, indent=1), "utf-8")
    print(f"{len(listas)} obras listas, {len(fallos)} con fallos")


if __name__ == "__main__":
    main()
