# Historias

Prototipo del nivel que está por encima de la unidad: varias obras encadenadas, como las pistas de un disco. Es una carpeta aparte; `unidad/` no se toca.

- En la web: [alsase10x.github.io/neoars/historias/](https://alsase10x.github.io/neoars/historias/)
- Primera historia: «Desde dentro», con *El dormitorio*, *La noche estrellada* y *El pañuelo rojo*.

## Cómo funciona

- **El tema manda.** Cada historia tiene sus propios textos para cada obra, escritos para su tema. No repite la visita de la unidad.
- **Portada.** Una pantalla propia, como la carátula de un disco: una sola imagen a sangre (una obra entera o un encuadre de ella), el título, el tema, la duración y «Escuchar». Sirve igual para tres obras que para treinta. Al pulsar, la entrada se cuenta sobre la propia portada, a pantalla completa, y la portada se retira al empezar la primera obra. «Ver las obras» despliega la tira de miniaturas para empezar por cualquiera, y «Saltar la entrada» va directo a la primera. El cierre suena en el reproductor, sobre el mismo encuadre.
- **Suena seguida.** Entrada, una parada por obra y cierre. Al pasar de una obra a otra, la imagen se funde con la siguiente mientras la voz sigue.
- **Arriba, lo que estás viendo.** En cada parada, la cabecera muestra la obra, su autor y su fecha; en la entrada y el cierre, la historia. Sobre el relato se ve dónde estás: «Desde dentro · 2 de 3».
- **Cada obra sigue siendo una parada.** En el relato, una línea fina marca dónde empieza, y tocarla salta a esa obra. «Ver la obra completa», que abre su unidad, está en el menú «⋯».
- **Ritmo variado.** Una cápsula `"k": "silencio"` muestra la frase, calla unos segundos (`pausa`) y deja subir la música para mirar.
- **De cada obra se toma** la imagen, las zonas, la ficha, las citas (con su voz) y las preguntas preparadas, que cambian según la obra que se está viendo.
- **La música es de la historia** y sigue al cambiar de obra.

## Formato de una historia

| Campo | Qué lleva |
| --- | --- |
| `titulo`, `tema` | Nombre y la idea que vertebra la historia |
| `portada` | `obra` (número de la parada cuya imagen hace de portada, desde 0) y, si se quiere, `encuadre` `[x, y, ancho, alto]` |
| `intro` | Cápsulas de entrada; se cuentan en la portada, a pantalla completa |
| `paradas` | Una por obra: `obra` (su archivo), `unidad` (enlace a su unidad completa) y `caps` |
| `cierre` | Cápsulas finales; suenan sobre el encuadre de la portada |
| `musica`, `nota`, `salir` | Pista, nota de créditos y vuelta a la portada |

Las cápsulas son las de la unidad: `t`, `z` (una zona de esa obra), `c` (una cita de esa obra), `k: "pregunta"` y, nuevo, `k: "silencio"` con `pausa` en segundos. La primera cápsula de cada parada hace de puente con la anterior.

Se abre otra historia con `?historia=<archivo>.json`, solo del mismo sitio.
