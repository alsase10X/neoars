# ADN · sistema de diseño común

Un solo sistema para NeoARS y artmedium. Este fichero, `adn.css`, guarda solo tokens: color, tipografía, escala, espaciado y forma. Los componentes viven en cada aplicación y leen estos valores.

La muestra en vivo está en [`adn/`](https://alsase10x.github.io/neoars/adn/): enseña los tres registros y lee los valores directamente de `adn.css`.

## Cómo se usa

```html
<html lang="es" data-adn-registro="museo" data-tema="oscuro">
<link rel="stylesheet" href="../adn/adn.css">
```

- `data-adn-registro`: `museo` (por defecto), `neutro` o `inmersivo`.
- `data-tema`: `oscuro` o `claro`. Museo arranca en oscuro y neutro en claro. Inmersivo es solo oscuro.
- El acento de cada muestra u obra se pone en `--c-acento`, a partir del color de la imagen.

## Los tres registros

| | Museo | Neutro | Inmersivo |
|---|---|---|---|
| Para qué | La microapp de una muestra: portada, catálogo, ficha, artista, historia | Salas y muestras que no quieren marca | Una obra en pantalla, para mirar y escuchar (la unidad de artmedium) |
| Fondo y texto | Negro y blanco; en claro, blanco y negro | Hueso y casi negro; en oscuro, casi negro y hueso | Casi negro y hueso, sobre el color difuminado de la obra |
| Escala de texto | 42 / 27 / 18 / 15 / 12 px | 36 / 24 / 17 / 15 / 13 px | La de museo |
| Espaciado | 9 · 18 · 27 · 45 · 72 px | 8 · 16 · 24 · 40 · 64 px | La de museo |
| Filete | 1 px | 0,5 px | 1 px, más suave |

Comunes a los tres: Archivo como única familia, margen lateral de 24 px, filas tocables de 56 px, columna de lectura de 430 px como máximo y esquinas rectas.

## Tokens

| Token | Qué es |
|---|---|
| `--c-fondo`, `--c-texto`, `--c-apagado`, `--c-filete`, `--c-acento` | Color |
| `--t-titulo`, `--t-obra`, `--t-cuerpo`, `--t-pieza`, `--t-cabecera`, `--t-dato` | Tamaños de texto |
| `--e-1` … `--e-5` | Espaciado |
| `--fuente`, `--radio`, `--grosor-filete`, `--interlineado`, `--ancho-texto` | Forma |
| `--margen`, `--fila`, `--ancho-max`, `--cabecera`, `--sup`, `--inf`, `--columnas-catalogo` | Estructura |

## Reglas

- Una sola familia, Archivo.
- Esquinas rectas. Solo los indicadores redondos (puntos, el sello) son círculos.
- El color lo pone la obra: la interfaz es neutra y el acento sale de la imagen.
- Texto alineado a la izquierda; el sello es la única excepción.
- El texto de lectura va junto a la imagen, nunca encima.
- Ningún texto por debajo de 12 px.

## Quién lo usa

| Aplicación | Registro | Cómo |
|---|---|---|
| `unidad/` (artmedium v1) | Inmersivo | Enlaza `adn.css`; sus variables propias apuntan a los tokens |
| `index.html` (inicio y catálogo) | Inmersivo | Igual |
| `miradas/` | Inmersivo | Igual |
| `muestras/sally-mann/` (NeoARS) | Museo, con opción neutro y claro | Lleva los mismos valores dentro del propio HTML, porque cada microapp de NeoARS es un fichero autónomo que funciona sin servidor |

Si cambia un valor aquí, hay que cambiarlo también en las microapps autónomas.

## Pendiente

- La unidad v1 todavía usa tamaños de texto propios, en rem. Pasarla a la escala de tokens.
- Museo usa una rejilla de 9 px y neutro una de 8 px. Decidir si se unifican.
