# Explorador de arte — planteamiento

*Nombre provisional. Documento de trabajo, 9 de octubre de 2026.*

Este documento explica qué estamos construyendo en este repositorio y en qué se diferencia de NeoARS, del que es complementario. Sigue el mismo criterio que el documento maestro de NeoARS: la sección de **decisiones** recoge lo que Alberto ha decidido; la de **propuestas** recoge ideas que no deben tratarse como cerradas hasta que él las confirme.

---

## 1. Qué es, en una frase

Un catálogo de obras de colecciones abiertas de museos, recorrido por **exposiciones temáticas** en las que **cada obra la presenta su propio autor**, interpretado por un modelo de lenguaje, y el visitante puede seguir la secuencia o detenerse a conversar.

---

## 2. Relación con NeoARS

Son dos formas de mediación sobre el mismo motor: catálogo, ficha, visor, sistema de diseño y una secuencia de paradas.

| | NeoARS | Explorador |
|---|---|---|
| Para quién | Una galería o museo, en una exposición temporal concreta | Público general, de forma continua |
| Artistas | Vivos y, en general, poco conocidos | Consagrados, con obra de dominio público |
| Obras | Las aporta el cliente | Colecciones abiertas (Art Institute of Chicago, The Met, Cleveland Museum of Art) |
| Mediación | Texto propio y voz real del artista, en scrollytelling | Secuencia por tema, mediada por el autor interpretado o por una guía |
| Modo | Guiado y cerrado: dice exactamente lo escrito | Guiado y abierto: secuencia fija, profundidad a demanda |
| Negocio | Servicio por exposición | Producto que crece con un tema nuevo cada cierto tiempo |

El scrollytelling y el recorrido son, en el fondo, lo mismo: una lista ordenada de momentos. Cambia lo que ocurre en cada parada: una escena que se lee o un encuentro en el que se puede conversar.

---

## 3. Decisiones de Alberto

### 3.1 Catálogo
- Exploración libre de colecciones abiertas de museos, con dos vistas: **mapa arrastrable** y **columnas**. El catálogo es el mismo que en NeoARS; el mapa es otra forma de verlo.

### 3.2 Mediación por el autor
- En lugar de textos para leer, **el autor presenta su obra** como si estuviera con el visitante delante de ella, en una exposición sobre su trabajo. No informa sobre su obra: la muestra y ayuda a mirarla.
- El modelo se alimenta de lo que sabe del autor, de la ficha del museo y, opcionalmente, de un contexto biográfico preparado.
- No tiene que ser perfecto, igual que un mediador humano, pero no debe inventar.
- Al final de cada intervención propone preguntas **que haría el visitante**, basadas en la respuesta y en la ficha, como guía para quien no sabe qué preguntar.

### 3.3 Qué autores hablan
- **No todos.** Solo autores seleccionados y bien documentados. La lista crece poco a poco.
- El **dossier** del autor (hechos, anécdotas, obras relacionadas, forma de hablar, citas verificadas) es una **capa opcional** que enriquece y ancla la conversación.
- Para obras sin autor de la lista, media una **guía del museo**: más genérica, en tercera persona.

### 3.4 Exposiciones (recorridos)
- La curación es **elegir un tema y las obras** que lo componen. No hay una voz curatorial aparte: solo habla quien media cada obra.
- El tema puede ser tan sencillo como **"Conoce a…"** (un autor y una secuencia de sus obras) o un tema relacional: filosófico, artístico, técnico o cualquier cosa humana. Cada obra se elige porque ya contiene algo de ese tema.
- **El tema entra en el prompt** de cada parada y orienta la mediación.

### 3.5 Navegación
- **"Siguiente obra" siempre disponible.** Profundizar con el autor es opcional; quien se cansa o no quiere preguntar, avanza.
- Dentro de una exposición se puede ir adelante y atrás, y salir al catálogo o a la lista de exposiciones.

### 3.6 Crecimiento
- La aplicación crece con **un tema o exposición nueva cada cierto tiempo** (semanal o diaria), para enganchar a quien le interese y mantenerla viva.

### 3.7 Interfaz
- Se mantiene el sistema de diseño actual.
- **Menos opciones, más minimalista.**
- La ficha y los datos del catálogo existen, pero **plegados justo después del título**.
- La conversación no tiene aspecto de chat. El texto **aparece poco a poco** y hay un indicador de carga que no dice "cargando".
- La **voz** es una opción previa y secundaria, no la principal.
- **Los colores salen de la obra**, no son aleatorios.

### 3.8 Alojamiento
- **GitHub Pages**, en este repositorio.
- Las **imágenes básicas** de las obras de las exposiciones se guardan en el propio repositorio.

---

## 4. Reglas de la mediación (implementadas)

1. **Jerarquía de fuentes:** la ficha del museo manda sobre los datos de la obra; después va el dossier y, al final, lo que el modelo sabe del autor.
2. **No inventar** fechas, obras, personas, lugares ni anécdotas. Si no sabe algo, lo dice.
3. **Mirar:** solo señala detalles que aparezcan en la ficha, en los textos del museo o en la descripción visual, o que sean muy conocidos. Si no, habla del conjunto.
4. **Citas:** nada entre comillas salvo las citas verificadas del dossier.
5. **Horizonte del personaje:** el autor solo sabe lo que vivió. No habla de su muerte ni de lo que pasó después con su obra.
6. **Temas delicados**, con sobriedad y solo si vienen al caso.
7. **El tema es una lente, no un dato:** orienta la mediación, pero el autor no puede decir que hizo la obra pensando en ese tema salvo que conste, ni forzar una relación que no existe.
8. **Marco visible:** siempre se indica que es una voz interpretada, no palabras literales del autor.

---

## 5. Cómo está construido

| Fichero | Para qué |
|---|---|
| `index.html` | La aplicación entera: un solo HTML, sin librerías. |
| `recorridos.json` | Las exposiciones: id, título, tema, fecha, portada y lista de obras (por ejemplo, `aic-28560`). Opcionalmente, una nota por obra que orienta al mediador sin mostrarse. |
| `scripts/descargar.py` | Descarga la ficha y la imagen de cada obra de las exposiciones. |
| `.github/workflows/imagenes.yml` | Ejecuta ese script en GitHub cada vez que cambia `recorridos.json`. |
| `data/`, `img/` | Fichas e imágenes propias, generadas por el script. La app las usa si existen y, si no, las pide al museo. |

La versión publicada **no lleva ninguna clave** de modelo: cada persona usa Puter o pega su propia clave en Ajustes.

### Publicar una exposición nueva
1. Componer el recorrido en **Mi recorrido**: título, tema y obras en orden. Exportar el JSON.
2. Pegar esa entrada en `recorridos.json` y subir el cambio.
3. La Action descarga fichas e imágenes. En unos minutos la exposición aparece con la marca **Nuevo**.

---

## 6. Propuestas pendientes de decisión

**No están decididas.**

- **Pantalla única:** convivencia del mapa del catálogo y las exposiciones en la misma pantalla.
- **Visión:** que el modelo vea la imagen y devuelva qué se ve y dónde. Hay acuerdo en principio; se haría con Groq como paso de preparación revisado, no en directo. Permitiría guiar la mirada y un "ver dónde" con zoom.
- **Zoom profundo** con OpenSeadragon sobre el IIIF del museo, con la imagen propia como respaldo.
- **Intermediario para la clave** (por ejemplo, un Cloudflare Worker), necesario para un uso público sin que cada persona ponga su clave.
- **Taller de producción con MCP:** herramientas para preparar recorridos desde Claude (buscar obras, descargar imágenes, analizar, escribir el JSON).
- **Edición propia para un museo** (por ejemplo, el Museo Gustavo de Maeztu): el mismo recorrido vive en la app global y en una edición del museo, abierta desde su QR.
- **Dos modos sobre la misma secuencia:** texto escrito (scrollytelling) como base y conversación con el autor como capa opcional. Implicaría un esquema común de "paradas" para NeoARS y el explorador.
- **Criterio para usar el modelo:** documentación suficiente (del modelo o de un dossier) y autorización (herederos o gestores de derechos en fallecidos recientes; con artistas vivos, solo su voz real y con su permiso).
- **Artistas vivos dentro de temas** junto a consagrados, con derechos y consentimiento.
- **Obra del día:** una parada ligera, además del tema periódico.
- **Retrato del autor** como avatar e **identificadores de museo** para reconocer a los autores (ahora se reconocen por el nombre).

---

## 7. Avisos

- El **dossier de Van Gogh** es un ejemplo de formato, redactado sin contrastar línea a línea con las fuentes. Hay que revisarlo antes de usarlo en público.
- Los **modelos gratuitos** tienen límites diarios bajos. Un recorrido de cinco obras con alguna pregunta gasta entre 8 y 10 llamadas.
- **Derechos:** algunas obras de autores fallecidos hace menos de 80 años pueden seguir protegidas en España (por ejemplo, Maeztu, fallecido en 1947). Hay que comprobarlo antes de usarlas. No es asesoramiento legal.
