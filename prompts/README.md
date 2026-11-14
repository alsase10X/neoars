# Hello Heritage · banco de pruebas de prompts

Para probar distintos prompts de «pieza que habla» con distintos modelos, siempre con la misma memoria y las mismas preguntas. Usa [promptfoo](https://www.promptfoo.dev), de código abierto.

Todos los modelos pasan por la [Agent API de Perplexity](https://docs.perplexity.ai/docs/agent-api/models): con una sola clave se prueban modelos de Anthropic, OpenAI, Google y otros. No se les dan herramientas, así que no buscan en internet.

Todo se ejecuta desde esta carpeta (`neoars/prompts`).

## Cómo está organizado

```
versiones/      una versión de prompt por archivo (.md)
  construir.js  monta cada prompt con los archivos de la pieza
  perplexity.js manda cada prompt al modelo de cada columna
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

Las plantillas de `versiones/` usan `{{identidad}}`, `{{representa}}` y `{{memoria}}`. El prompt va como instrucciones del modelo y la frase del visitante como mensaje de usuario.

## Probar

Necesitas Node 18 o posterior.

1. Copia `.env.example` como `.env` y pon tu clave de Perplexity. Mejor una solo para pruebas, distinta de la del intermediario de Cloudflare: si algo va mal, la anulas sin tocar la sala.
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

La tabla enseña también lo que ha costado cada respuesta. Hoy son 4 prompts × 6 visitas × 4 modelos: 96 llamadas.

Para probar solo una parte:

```
npx promptfoo@latest eval --env-file .env --no-cache --filter-prompts personaje --filter-providers haiku
```

## Añadir cosas

- **Otro prompt:** crea `versiones/nombre.md`, añade `nombre: construir('nombre')` al final de `construir.js` y una entrada en `prompts:` de `promptfooconfig.yaml`.
- **Otra pieza:** copia la carpeta de Alberti, cambia los archivos y cambia `pieza` y `tests` en `promptfooconfig.yaml`.
- **Otro modelo:** quita el `#` de uno de los bloques comentados de `promptfooconfig.yaml`, o copia un bloque y cambia `modelo` por cualquiera de la [lista de Perplexity](https://docs.perplexity.ai/docs/agent-api/models).

## Cuidado

- Esta carpeta está en un repositorio público: las memorias y los prompts se ven. Las claves no, porque `.env` no se sube.
- No añadas herramientas en `perplexity.js`: con `web_search` el modelo buscaría en internet y ya no probaríamos la memoria.
- La temperatura no se puede fijar por esta vía, así que la misma pregunta puede dar respuestas distintas. Para comparar con justicia, repite la prueba dos o tres veces (`--repeat 3`).
- El aviso «breve» marca las respuestas de más de 80 palabras. Es un aviso, no una nota.
- Cada visita es un primer mensaje suelto. Las conversaciones de varios turnos, más adelante.
