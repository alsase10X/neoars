# Muestras de NeoARS

Cada carpeta es la app de una exposición: una microapp (`index.html`) y su historia (`historia.html`). Son ficheros autónomos, con las imágenes dentro, que funcionan sin servidor. Usan los valores del [ADN](../adn/README.md), registro museo, copiados dentro del propio HTML.

## Sally Mann · Macula et Materia

Kutxa Fundazioa Artegunea, Tabakalera (Donostia), del 17 de julio al 18 de octubre de 2026. Con permiso de la artista.

- [Microapp](https://alsase10x.github.io/neoars/muestras/sally-mann/) · [Historia](https://alsase10x.github.io/neoars/muestras/sally-mann/historia.html)
- Pensada primero para la visita a distancia, en el móvil: la historia sigue los seis capítulos de la guía de sala y cada texto señala algo que se ve en pantalla.
- Se monta con `scripts/sally_mann.py` a partir de la microapp y la historia de partida y de las imágenes de la guía (`pdfimages -all -p guia.pdf g`).

Pendiente:

- Las imágenes que vienen de la guía son pequeñas (230–490 px) y no llevan lupa. Hay que sustituirlas por originales de la artista o de Gagosian.
- Goshen todavía no tiene imagen.
- Los textos están escritos para esta maqueta: los tiene que validar la artista o la sala.
- El plano de sala y el recorrido en sala son de ejemplo, no el montaje real.
