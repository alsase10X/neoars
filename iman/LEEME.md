# El imán de artmedium

*Documento de trabajo, 21 de octubre de 2026.*

El QR del reverso de un imán abre esta página: el personaje del imán, que habla y media su propia obra. Un solo motor sirve para cualquier personaje y para cualquier exposición; lo que cambia son los datos.

## Cómo se abre

- `iman/?p=van-gogh` · `iman/?p=monet` — un personaje.
- `iman/?p=monet&e=vincent-y-monet` — con su exposición (si no se dice, `vincent-y-monet`).
- En GitHub Pages funcionan el micrófono y las voces del navegador; dentro de Claude, el micrófono no.

## Tres niveles

1. **El motor** (`motor/`): la portada con dos puertas (Sus obras · Hablar), el mapa de su obra, la obra a pantalla completa contada por él, la conversación y las instrucciones para el modelo (`prompt.js`). No sabe nada de ningún personaje.
2. **La exposición** (`exposiciones/<id>.json`): nombre, cliente, tema común y sus personajes. Los personajes de una misma exposición se conocen: «También en…» en la portada y en el menú, y un enlace para hablar con el otro si se le pregunta por él.
3. **El personaje** (`personajes/<id>/`):
   - `ficha.json` — quién es, sus textos fijos, su voz, su paleta («Su color»), su kit de ilustración, las partes variables de sus instrucciones (`ficha_ia`, con su tema) y su banco de preguntas y respuestas (`qa`).
   - `obras.json` — sus obras propias (preparadas a fondo, con zonas y visita), «Para empezar», los títulos en castellano y, generado, el catálogo, las épocas y las selecciones.
   - `arte/` — el retrato (compuesto o recortado), la línea sola para el fondo y el patrón.

## Scripts

- `python3 iman/scripts/catalogo.py <personaje>` — rehace el catálogo desde `data/artistas/<id>.json`, `artistas/<id>.json` y `unidad/obras/breves.json`, con las imágenes de `img/`.
- `python3 iman/scripts/montar.py repo` — rehace `iman/index.html` desde `motor/cuerpo.html`.
- `python3 iman/scripts/montar.py claude <salida.html>` — una sola página con todo incrustado, para publicarla como artefacto de Claude; deja al lado la lista de imágenes que hay que publicar con ella.

## Estado

- **Vincent:** 21 obras; tres preparadas a fondo (La noche estrellada, El dormitorio, Autorretrato) y trece con visita en su voz. Retrato provisional (el suyo, recoloreado con la paleta de «Su color»).
- **Monet:** 28 obras, once con visita en su voz, ninguna preparada a fondo todavía. Retrato provisional: la foto de Nadar de 1899 en duotono. Falta su ilustración, su línea y su patrón.
- **Sin modelo de IA:** las preguntas libres se comparan con el banco; las instrucciones para el modelo ya se componen (menú ⋯ › «Sus instrucciones»).
- Textos pendientes de revisión.
