# Miradas

Maqueta de una pieza de NeoARS mediada por **miradas**: lo que vieron otras personas, cada una clavada en el punto de la obra del que habla. Es una carpeta aparte; `unidad/` no se toca.

- En la web: [alsase10x.github.io/neoars/miradas/](https://alsase10x.github.io/neoars/miradas/)
- Obra de prueba: *El pañuelo rojo*, con las zonas de la versión generativa. Las miradas y el mapa de primeras miradas son **ejemplos escritos** para enseñar el funcionamiento; no son de visitantes reales.

## Cómo funciona

- **Primero miras tú.** La pieza se abre con la obra y una sola pregunta: «¿Dónde se te va la mirada primero?». Un toque basta. Después aparece dónde miró primero el resto de la gente, como un mapa de calor que se desvanece, y la frase «Tu mirada fue a la capa roja. A 11 personas les pasó lo mismo». Se puede saltar.
- **Las miradas viven en la obra, no debajo.** Cada una es un punto sobre el cuadro. Tocar un punto, una tarjeta o una parte de la obra lleva la cámara allí. Arriba de la lista, las partes de la obra con cuántas miradas tiene cada una.
- **Voces con nombre de rol, sin perfiles.** Visitante (en la sala o desde casa), invitada o invitado, mediación y, si quiere, el artista. Ninguna va siempre arriba.
- **«Ahora lo veo» en lugar de «me gusta».** Dice que una mirada te hizo ver algo nuevo. El orden: las tuyas primero; luego por «Ahora lo veo», procurando que las primeras sean de voces distintas. La mediación o el artista pueden destacar alguna, y se ve quién lo hizo.
- **Añadir tu mirada.** Tocas el sitio, escribes (o dictas) qué ves y dices si estás delante de la obra o en casa. Después, la pregunta de Visual Thinking Strategies: «¿Qué ves ahí que te hace decir eso?», opcional.
- **Sin muro, sin hilos, sin contadores de seguidores.** Si quieres contestar a alguien, lo haces con otra mirada sobre la misma parte de la obra.

## Lo que falta para que sea real

- **Guardar y compartir.** En la maqueta, tus miradas y tus «Ahora lo veo» se quedan en tu dispositivo. Compartirlas exige un sitio donde guardarlas mientras dura la exposición, con moderación; al cerrarla, se congelan dentro de la PWA como memoria.
- **Notas de voz.** Grabar la mirada con la propia voz (y oír las de otros) en lugar de dictarla.
- **Consentimiento y privacidad**: aviso claro, participación anónima posible, cuidado con menores.
- **Voz del artista**: módulo opcional; en esta obra no hay.

## Archivos

| Archivo | Qué lleva |
| --- | --- |
| `index.html` | La pieza: motor, estilo y textos de la interfaz |
| `el-panuelo-rojo.json` | La obra (enlace a su ficha y zonas), la imagen, la pregunta de entrada, las primeras miradas de ejemplo y las miradas de ejemplo: `x`, `y` (0–1), `t`, `porque`, `quien.rol`, `quien.como`, `origen` (`sala`/`casa`), `ahora`, `destacada` |
