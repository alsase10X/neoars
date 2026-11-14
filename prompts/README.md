# Hello Heritage · banco de pruebas de prompts

Para probar distintos prompts de «pieza que habla» con distintos modelos, siempre con la misma memoria y las mismas preguntas. Usa [promptfoo](https://www.promptfoo.dev), de código abierto.

Todo se ejecuta desde esta carpeta (`neoars/prompts`).

## Cómo está organizado

```
versiones/      una versión de prompt por archivo (.md)
  construir.js  monta cada prompt con los archivos de la pieza
piezas/
  alberti-polvorista/
    identidad.md   qué es y dónde está (una línea)
    representa.md  la línea que separa la pieza de la persona (si la hay)
    memoria.md     lo que sabe la pieza
    visitas.yaml   las preguntas de prueba
    fuentes.md     de dónde sale cada dato y qué falta comprobar
notas.md        lo que vamos aprendiendo
promptfooconfig.yaml
```

Las plantillas de `versiones/` usan `{{identidad}}`, `{{representa}}` y `{{memoria}}`. El prompt va como mensaje de sistema y la frase del visitante como mensaje de usuario.

## Probar

Necesitas Node 18 o posterior.

1. Copia `.env.example` como `.env` y pon tus claves de API.
2. Vista previa gratis (sin llamar a ningún modelo; enseña el prompt montado):
   ```
   npx promptfoo@latest eval --providers echo --no-cache
   ```
3. Prueba de verdad:
   ```
   npx promptfoo@latest eval --env-file .env --no-cache
   ```
4. Ver los resultados en el navegador, lado a lado:
   ```
   npx promptfoo@latest view
   ```

Para guardar una tabla de una prueba: añade `-o resultados/AAAA-MM-DD.html` al paso 3.

## Añadir cosas

- **Otro prompt:** crea `versiones/nombre.md`, añade `nombre: construir('nombre')` al final de `construir.js` y una entrada en `prompts:` de `promptfooconfig.yaml`.
- **Otra pieza:** copia la carpeta de Alberti, cambia los archivos y cambia `pieza` y `tests` en `promptfooconfig.yaml`.
- **Otro modelo:** quita el `#` de las líneas de OpenAI o Google en `promptfooconfig.yaml` y pon el nombre exacto del modelo.

## Cuidado

- Esta carpeta está en un repositorio público: las memorias y los prompts se ven. Las claves no, porque `.env` no se sube.
- Usa modelos por API, sin búsqueda en internet: la pieza solo debe saber lo que está en su memoria.
- El aviso «breve» marca las respuestas de más de 80 palabras. Es un aviso, no una nota.
- Cada visita es un primer mensaje suelto. Las conversaciones de varios turnos, más adelante.
