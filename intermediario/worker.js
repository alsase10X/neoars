// artmedium · intermediario de IA (Cloudflare Worker)
// Guarda las claves y reenvía a los proveedores lo que pide la sala:
//   POST /       {input: [{role, content}, ...]}  → texto de Perplexity (Agent API)
//   POST /voz    {texto, voz}                      → audio mp3 de Mistral (Voxtral TTS 3)
//   GET  /voces  ?language=es&gender=&query=       → lista de voces predefinidas de Mistral (JSON)
//   GET  /                                         → estado de las claves
//
// En Cloudflare (Settings › Variables and Secrets):
//   PERPLEXITY_API_KEY  (Secret)  la clave de la consola de Perplexity
//   MISTRAL_API_KEY     (Secret)  la clave de la consola de Mistral
//   MODELO              (Text, opcional)  por defecto anthropic/claude-haiku-5-5
//   MODELO_VOZ          (Text, opcional)  por defecto voxtral-mini-tts-3-0
//   ORIGENES            (Text, opcional)  webs que pueden llamarlo, separadas por comas
//
// Sin herramientas: el modelo no busca en la web y responde solo con la base de la pieza que le manda la página.

const MODELO = 'anthropic/claude-haiku-5-5';
const MODELO_VOZ = 'voxtral-mini-tts-3-0';
const ORIGENES = 'https://alsase10x.github.io';
const MAX_CUERPO = 60000;   // caracteres: la base de una pieza y unos pocos turnos caben de sobra
const MAX_TURNOS = 12;
const MAX_SALIDA = 700;     // tokens de respuesta
const MAX_VOZ = 3000;       // caracteres por locución (a 13 $ el millón, unos 4 céntimos como mucho)

export default {
  async fetch(req, env) {
    const permitidos = (env.ORIGENES || ORIGENES).split(',').map(s => s.trim()).filter(Boolean);
    const origen = req.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': permitidos.includes(origen) ? origen : permitidos[0],
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin'
    };
    const texto = (t, status = 200) => new Response(t, {status, headers: {...cors, 'Content-Type': 'text/plain; charset=utf-8'}});
    const ruta = new URL(req.url).pathname.replace(/\/+$/, '') || '/';

    if (req.method === 'OPTIONS') return new Response(null, {status: 204, headers: cors});

    if (req.method === 'GET' && ruta === '/voces') {
      if (!env.MISTRAL_API_KEY) return texto('Falta la clave MISTRAL_API_KEY', 500);
      const q = new URL(req.url).searchParams, p = new URLSearchParams({type: 'preset', page_size: '100'});
      for (const k of ['language', 'gender', 'query']) if (q.get(k)) p.set(k, q.get(k).slice(0, 40));
      const r = await fetch('https://api.mistral.ai/v2/audio/voices?' + p, {headers: {'Authorization': 'Bearer ' + env.MISTRAL_API_KEY}});
      if (!r.ok) return texto('Mistral no ha respondido (' + r.status + ')', 502);
      const j = await r.json();
      const voces = (j.data || j.items || []).map(v => ({id: v.id, nombre: v.name, idiomas: v.languages, genero: v.gender, edad: v.age, desc: v.description, slug: v.slug}));
      return new Response(JSON.stringify(voces), {headers: {...cors, 'Content-Type': 'application/json; charset=utf-8'}});
    }

    // Abrir la dirección en el navegador sirve para comprobar que está bien montado
    if (req.method === 'GET') return texto('artmedium-ia: texto ' + (env.PERPLEXITY_API_KEY ? 'listo' : 'sin clave') + ' · voz ' + (env.MISTRAL_API_KEY ? 'lista' : 'sin clave'));
    if (req.method !== 'POST') return texto('Método no permitido', 405);
    if (!permitidos.includes(origen)) return texto('Origen no permitido', 403);

    const cuerpo = await req.text();
    if (cuerpo.length > MAX_CUERPO) return texto('Demasiado largo', 413);
    let datos;
    try { datos = JSON.parse(cuerpo); } catch (e) { return texto('JSON no válido', 400); }

    if (ruta === '/voz') {
      if (!env.MISTRAL_API_KEY) return texto('Falta la clave MISTRAL_API_KEY', 500);
      const dicho = typeof datos.texto === 'string' ? datos.texto.trim() : '';
      if (!dicho) return texto('Falta el texto', 400);
      if (dicho.length > MAX_VOZ) return texto('Texto demasiado largo para una locución', 413);
      if (typeof datos.voz !== 'string' || !datos.voz || datos.voz.length > 80) return texto('Falta la voz', 400);
      const r = await fetch('https://api.mistral.ai/v1/audio/speech', {
        method: 'POST',
        headers: {'Authorization': 'Bearer ' + env.MISTRAL_API_KEY, 'Content-Type': 'application/json'},
        body: JSON.stringify({model: env.MODELO_VOZ || MODELO_VOZ, input: dicho, voice_id: datos.voz, response_format: 'mp3'})
      });
      if (!r.ok) return texto('Mistral no ha respondido (' + r.status + '): ' + (await r.text()).slice(0, 300), 502);
      const j = await r.json();
      if (!j.audio_data) return texto('Mistral no ha devuelto audio', 502);
      const audio = Uint8Array.from(atob(j.audio_data), c => c.charCodeAt(0));
      return new Response(audio, {headers: {...cors, 'Content-Type': 'audio/mpeg'}});
    }

    if (!env.PERPLEXITY_API_KEY) return texto('Falta la clave', 500);
    const turnos = Array.isArray(datos.input)
      ? datos.input.filter(t => t && typeof t.content === 'string' && t.content.trim()).slice(-MAX_TURNOS)
          .map(t => ({role: t.role === 'assistant' ? 'assistant' : 'user', content: t.content}))
      : [];
    if (!turnos.length) return texto('Falta la conversación', 400);

    const base = {model: env.MODELO || MODELO, max_output_tokens: MAX_SALIDA};
    // Primero, la conversación con sus papeles; si la API no la acepta así, la misma conversación en un solo texto
    let r = await pedir(env, {...base, input: turnos});
    if (r.status === 400 || r.status === 422) {
      r = await pedir(env, {...base, input: turnos.map(t => (t.role === 'assistant' ? 'Respuesta anterior: ' : '') + t.content).join('\n\n')});
    }
    if (!r.ok) return texto('El modelo no ha respondido (' + r.status + ')', 502);

    const j = await r.json();
    const salida = (j.output || []).filter(o => o && o.type === 'message')
      .flatMap(o => o.content || []).filter(c => c && c.type === 'output_text').map(c => c.text).join('') || j.output_text || '';
    return texto(salida);
  }
};

const pedir = (env, cuerpo) => fetch('https://api.perplexity.ai/v1/agent', {
  method: 'POST',
  headers: {'Authorization': 'Bearer ' + env.PERPLEXITY_API_KEY, 'Content-Type': 'application/json'},
  body: JSON.stringify(cuerpo)
});
