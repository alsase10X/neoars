# Hello Heritage · offsite 3D (demo)

Una escultura en 3D (Gaussian splat) que conversa contigo y mueve la cámara hacia lo que conviene mirar mientras habla.

- `movil/`: pensada primero para el móvil. Modelo a pantalla completa, lo que dice la pieza como subtítulos, preguntas sugeridas en chips y ajustes en un menú. Modelo ligero (250.000 splats) y hoja de vistas ya hecha.
- `portatil/`: primera versión, con el modelo a la izquierda y la conversación a la derecha (600.000 splats).

## Cómo verla

Son páginas estáticas: sirven GitHub Pages o cualquier servidor web. No funcionan abriendo el `index.html` con doble clic, porque cargan módulos y archivos.

```
cd offsite-3d
python3 -m http.server 8000
# abre http://localhost:8000/movil/
```

## La IA

- Dentro de claude.ai (como artefacto), la pieza habla con Claude.
- Fuera de claude.ai, habla con Gemini: abre el menú («La IA fuera de claude.ai»), pega tu clave de la API de Gemini y pulsa «Guardar y activar». La clave se guarda solo en ese navegador (localStorage) y nunca va en el código. Si dejas vacío el modelo, usa el Flash más reciente que ofrezca tu clave.

En cada turno la pieza recibe la ficha, el prompt, una hoja con ocho vistas suyas marcadas en grados (`hermes-vistas.jpg` en la versión móvil) y una captura de lo que ve la persona. Tiene dos herramientas: `mirar` (mueve la cámara) y `sugerir` (muestra preguntas). La ficha y el prompt se pueden editar en la propia página.

## Tu propia pieza

En «Tu splat» se abre una captura propia (.spz, .ply, .splat o .ksplat; por ejemplo, exportada desde Scaniverse). Se carga solo en el navegador. Después hay que escribir su ficha.

## Créditos y licencias

- Modelo: escaneo del vaciado en yeso del *Hermes atándose la sandalia* (Institut für Klassische Archäologie, Viena) por Three D Scans (Oliver Laric), publicado sin restricciones de copyright; malla optimizada por Keijiro Takahashi ([keijiro/ThreeDScans](https://github.com/keijiro/ThreeDScans)). Para esta demo se convirtió la malla en splat: no es una captura fotográfica, el yeso no tiene color y la luz está horneada.
- `hermes.spz.txt` es el archivo SPZ en base64 (el servidor de artefactos de Claude no sirve .spz).
- Visor: [Spark](https://github.com/sparkjsdev/spark) 2.4.0 (MIT) y [three.js](https://github.com/mrdoob/three.js) r181 (MIT), incluidos en `lib/`.
