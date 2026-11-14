# Pruebas urbanas

Banco de pruebas para encontrar el prompt maestro de las piezas urbanas: una sola pieza, sin mapa, y varias versiones de reglas para comparar en el móvil, delante de la pieza. `unidad/` no se toca.

- En la web: [alsase10x.github.io/neoars/urbano-pruebas/](https://alsase10x.github.io/neoars/urbano-pruebas/)
- Abajo a la izquierda, una barra con dos menús: **qué pieza** y **qué reglas**. Al cambiar, la página se recarga.
- También por la dirección: `?pieza=fueros&reglas=personaje`.

## Qué hay

| Carpeta o archivo | Para qué |
| --- | --- |
| `index.html` | Copia del motor de `unidad/sala`, con tres cambios: abre una sola pieza (`?pieza=`), lee las reglas de `reglas/` (`?reglas=`) y lleva la barra de pruebas. |
| `piezas/` | Las piezas de prueba, con el mismo formato que `unidad/obras/calle/`. |
| `reglas/` | Las versiones de reglas. `actual` es copia de `unidad/prompt.json`. |
| `pruebas.json` | Lo que ofrece la barra. Para añadir una pieza o unas reglas: su archivo y una línea aquí. |

## Las versiones de reglas

Todas comparten la parte técnica que el motor necesita: los datos de la pieza, las zonas, la base documental, las imágenes, el marcado de cada frase (fuente, vista, lectura, general) y el formato de la respuesta. Cambia la voz:

- **actual**: el reglamento de la sala, con voz de guía.
- **personaje**: la pieza quiere que sigas hablando con ella. Solo quién es, la situación y lo que quiere.
- **mediador**: acompaña la curiosidad del visitante, admite conocimiento general y está escrito para el oído.

## Los tipos de pieza

Lo que cambia entre tipos no es el prompt, sino la memoria de la pieza. En la ficha, el campo `representa` es una frase que separa la pieza de lo que representa:

- **Persona real** (Goya): «Él fue la persona; tú eres el bronce».
- **Hecho o causa** (Fueros): «Tú no viviste aquello: te pusieron aquí para recordarlo».
- **Objeto útil o recreación** (almadía): «Quienes te hicieron y te usaron son otros».

## Al probar

- La visita grabada de cada pieza es la misma con todas las reglas. Las reglas cambian las respuestas a lo que preguntes después.
- Las piezas con `"nube": true` contestan por el intermediario (Claude Haiku a través de Perplexity) y gastan del saldo de Perplexity.
