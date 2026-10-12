# Historias

Prototipo del nivel que está por encima de la unidad: varias obras encadenadas, como las pistas de un disco. Es una carpeta aparte; `unidad/` no se toca.

- En la web: [alsase10x.github.io/neoars/historias/](https://alsase10x.github.io/neoars/historias/)
- Primera historia: «Desde dentro», con *El dormitorio*, *La noche estrellada* y *El pañuelo rojo*.

## Cómo funciona

- **El tema manda.** Cada historia tiene sus propios textos para cada obra, escritos para su tema. No repite la visita de la unidad.
- **Suena seguida.** Entrada, una parada por obra y cierre. Al pasar de una obra a otra, la imagen se funde con la siguiente mientras la voz sigue.
- **Cada obra sigue siendo una parada.** Su cabecera en el relato dice «2 de 3» y lleva a «Ver la obra completa», que abre su unidad. Tocar la cabecera salta a esa obra.
- **Ritmo variado.** Una cápsula `"k": "silencio"` muestra la frase, calla unos segundos (`pausa`) y deja subir la música para mirar.
- **De cada obra se toma** la imagen, las zonas, la ficha, las citas (con su voz) y las preguntas preparadas, que cambian según la obra que se está viendo.
- **La música es de la historia** y sigue al cambiar de obra.

## Formato de una historia

| Campo | Qué lleva |
| --- | --- |
| `titulo`, `tema` | Nombre y la idea que vertebra la historia |
| `intro` | Cápsulas de entrada; se ven sobre la primera obra |
| `paradas` | Una por obra: `obra` (su archivo), `unidad` (enlace a su unidad completa) y `caps` |
| `cierre` | Cápsulas finales; se ven sobre la última obra |
| `musica`, `nota`, `salir` | Pista, nota de créditos y vuelta a la portada |

Las cápsulas son las de la unidad: `t`, `z` (una zona de esa obra), `c` (una cita de esa obra), `k: "pregunta"` y, nuevo, `k: "silencio"` con `pausa` en segundos. La primera cápsula de cada parada hace de puente con la anterior.

Se abre otra historia con `?historia=<archivo>.json`, solo del mismo sitio.
