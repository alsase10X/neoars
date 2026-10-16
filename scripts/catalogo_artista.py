#!/usr/bin/env python3
"""Para cada artista de artistas/*.json, guarda en data/artistas/<id>.json la lista de sus obras de dominio público
en el Art Institute de Chicago y en el Museo de Arte de Cleveland, con el texto de cada museo. Sirve para elegir
selecciones y escribir las mediaciones a partir del texto real (desde aquí no hay red hacia los museos).

Si la configuración del artista trae «foto» con «origen» (una URL) y el archivo «src» no existe, lo descarga.

Se ejecuta en GitHub Actions (ver .github/workflows/imagenes.yml).
"""
import io
import json
import pathlib
import re
import sys
import time

import requests
from PIL import Image

RAIZ = pathlib.Path(__file__).resolve().parent.parent
AGENTE = "neoars-explorador (https://github.com/alsase10X/neoars)"
CAB = {"User-Agent": AGENTE, "AIC-User-Agent": AGENTE}
ATRIB = re.compile(r"^(after|follower|circle|school|workshop|imitator|copy|style|attributed)\b", re.I)


def plano(t):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", t or "")).strip()


def aic(nombre):
    campos = "id,title,date_display,date_start,artwork_type_title,is_on_view,gallery_title,description,short_description,image_id,thumbnail,artist_title,artist_display"
    q = {"query": {"bool": {"must": [{"match_phrase": {"artist_title": nombre}}],
                            "filter": [{"term": {"is_public_domain": True}}, {"exists": {"field": "image_id"}}]}},
         "limit": 100, "fields": campos.split(",")}
    r = requests.post("https://api.artic.edu/api/v1/artworks/search", json=q, headers=CAB, timeout=60)
    r.raise_for_status()
    out = []
    for a in r.json()["data"]:
        if (a.get("artist_title") or "") != nombre:
            continue
        out.append({"key": f"aic-{a['id']}", "titulo": a["title"], "fecha": a.get("date_display"), "año": a.get("date_start"),
                    "tipo": a.get("artwork_type_title"), "sala": a.get("gallery_title") if a.get("is_on_view") else None,
                    "texto": plano(a.get("description")) or None, "breve": plano(a.get("short_description")) or None,
                    "alt": (a.get("thumbnail") or {}).get("alt_text")})
    return out


def cma(nombre):
    p = {"q": nombre, "has_image": 1, "cc0": 1, "limit": 100,
         "fields": "id,title,creation_date,creation_date_earliest,creators,type,current_location,description,did_you_know,url"}
    r = requests.get("https://openaccess-api.clevelandart.org/api/artworks/", params=p, headers=CAB, timeout=60)
    r.raise_for_status()
    out = []
    for a in r.json()["data"]:
        cr = (a.get("creators") or [{}])[0].get("description") or ""
        if not cr.startswith(nombre) or ATRIB.match(cr):
            continue
        out.append({"key": f"cma-{a['id']}", "titulo": a["title"], "fecha": a.get("creation_date"), "año": a.get("creation_date_earliest"),
                    "tipo": a.get("type"), "sala": a.get("current_location"), "texto": plano(a.get("description")) or None,
                    "breve": plano(a.get("did_you_know")) or None, "url": a.get("url")})
    return out


def foto(cfg):
    f = cfg.get("foto") or {}
    if not f.get("origen") or not f.get("src"):
        return
    ruta = RAIZ / f["src"]
    if ruta.exists():
        return
    r = requests.get(f["origen"], headers={"User-Agent": AGENTE}, timeout=120, allow_redirects=True)
    r.raise_for_status()
    im = Image.open(io.BytesIO(r.content)).convert("RGB")
    if im.width > 1200:
        im = im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS)
    ruta.parent.mkdir(parents=True, exist_ok=True)
    im.save(ruta, "JPEG", quality=86, optimize=True, progressive=True)
    print("foto", ruta, im.size)


def main():
    salida = RAIZ / "data" / "artistas"
    salida.mkdir(parents=True, exist_ok=True)
    for ruta in sorted((RAIZ / "artistas").glob("*.json")):
        cfg = json.loads(ruta.read_text("utf-8"))
        nombre = cfg["nombre"]
        try:
            foto(cfg)
        except Exception as e:
            print("FALLO foto", ruta.name, e, file=sys.stderr)
        obras = []
        for f in (aic, cma):
            try:
                obras += f(nombre)
            except Exception as e:
                print("FALLO", f.__name__, nombre, e, file=sys.stderr)
            time.sleep(1)
        obras.sort(key=lambda o: o.get("año") or 9999)
        (salida / f"{cfg['id']}.json").write_text(json.dumps({"nombre": nombre, "obras": obras}, ensure_ascii=False, indent=1), "utf-8")
        print(nombre, len(obras), "obras,", sum(1 for o in obras if o["texto"]), "con texto del museo")


if __name__ == "__main__":
    main()
