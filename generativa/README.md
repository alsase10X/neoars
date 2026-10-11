# Unidad generativa (v2)

Prueba de la unidad de obra mediada con una capa generativa encima de la visita del museo. Es una copia aparte: `unidad/` no se toca.

- En la web: [alsase10x.github.io/neoars/generativa/](https://alsase10x.github.io/neoars/generativa/)
- Variante de diseño para comparar: [generativa/reproductor.html](https://alsase10x.github.io/neoars/generativa/reproductor.html)
- Imágenes y música: las de `unidad/`, sin copiarlas.

## Variante «reproductor»

Mismo motor y mismos datos; solo cambia la interfaz.

- **Abajo, un reproductor.** Una barra de progreso con un segmento por cápsula, largo según lo que dura, con el tiempo transcurrido y el total aproximado. Tocar un segmento salta a esa cápsula, igual que tocar el texto. Debajo, reproducir, la pregunta y el micrófono; al escribir, el botón de reproducir deja sitio al de enviar. Sin botones de atrás y adelante: el relato se sigue recorriendo con el dedo.
- **Arriba, un solo menú «⋯».** Junta la ficha y las fuentes, la música, quién te la cuenta, la visita y lo que sé de ti. La cabecera queda con la flecha, el título y la fecha.

## Dónde funciona lo generativo

| Dónde se abre | Qué hace |
| --- | --- |
| Dentro de Claude (artifact) | Escribe miradas y responde preguntas con Claude, con el uso de la cuenta de quien la abre |
| GitHub Pages, sin servidor | Solo las miradas preparadas y las respuestas preparadas del museo |
| Con servidor intermedio | Todo, con el modelo que elijáis: se pone su dirección en `CONFIG.api` |

El servidor recibe `POST {input, imagen}` y devuelve el texto en streaming. La clave del modelo vive en el servidor, nunca en la web.

## Qué cambia respecto a `unidad/`

- **Miradas.** Al terminar una visita se proponen tres ángulos; cada mirada termina con tres más. Las preparadas salen del archivo de la obra; las nuevas se escriben en el momento.
- **En directo.** La voz empieza con la primera cápsula mientras llega el resto. El modelo solo puede nombrar zonas que existen, así que la cámara se mueve igual que en una visita escrita a mano.
- **Contada para ti.** El visitante cuenta algo de sí. Se guarda solo en el dispositivo y vale para todas las obras.
- **El visitante propone.** Su propio ángulo, preguntas libres, «No lo veo así» (la guía pregunta qué ve) y «Mírala desde aquí», que convierte una conversación en una mirada.
- **Cada cápsula dice de dónde sale.** Fuente (con su entrada de la base documental), A la vista, Lectura o Conocimiento general. Si el modelo da una fuente que no existe, baja a «verifícalo».
- **Tu recorrido.** Las miradas abiertas quedan como fichas para volver a ellas.
- **La exposición manda.** `expo.json` fija el orden de las obras y la salida. Se cambia de obra sin recargar.
- **Seguridad.** `?obra=` solo abre obras del mismo sitio, y la ficha solo admite enlaces y cursivas.

## Formato: lo nuevo en el archivo de una obra

Todo es opcional: una obra de `unidad/` funciona tal cual (prueba con *La noche estrellada*).

| Campo | Qué lleva |
| --- | --- |
| `base` | La base documental: `[{id, f, t}]`, con identificador, fuente y texto. Es lo único que una mirada puede presentar como dato. Si falta, se monta con la ficha, las citas y los textos preparados |
| `zonas.<id>.vista` | Lo que se ve en esa zona, descrito sin interpretar. Es el vocabulario que lee el modelo |
| `zonas.<id>.poly` | Puede ser una lista de polígonos (las dos cortinas, por ejemplo) |
| `miradas.angulos` | Los ángulos que se ofrecen al terminar la visita general |
| `miradas.banco` | Miradas preparadas: `titulo`, `gancho`, `tema`, `foco`, `caps`, `angulos` y, si es para un perfil, `perfil` |

Cada cápsula de una mirada lleva `z`, `t`, `e` (`fuente`, `vista`, `lectura` o `general`) y `f` (el identificador de la base, si es fuente). Las preguntas para mirar llevan `k: "pregunta"`.

## Para revisar

- Las tres miradas preparadas de *El pañuelo rojo* y la de fotografía.
- Las nueve zonas y sus descripciones (nuevas: capa, manilla, habitación, suelo; las cortinas ya cubren las dos).
- La base documental: traducción propia de la ficha, procedencia, exposiciones, bibliografía y biografía del Cleveland Museum of Art (CC0).
- La respuesta sobre la procedencia, corregida: Michel Monet lo recibe en 1931.
- El prompt: `textoObra()`, `textoVisitante()`, `REGLAS`, `promptMirada()` y `promptChat()` en `index.html`.
