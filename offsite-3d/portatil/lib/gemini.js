// Adaptador mínimo de la API de Gemini con la misma forma que claude.use("sample"):
// sample(mensajes, { tools, images, onText, signal }) -> { text }.
// Solo se usa fuera de claude.ai (por ejemplo, en GitHub Pages). La clave la pone quien usa la página
// y se queda en su navegador; nunca va en el código.
const API = 'https://generativelanguage.googleapis.com/v1beta';

function upperTypes(schema) {
  if (Array.isArray(schema)) return schema.map(upperTypes);
  if (!schema || typeof schema !== 'object') return schema;
  const out = {};
  for (const [k, v] of Object.entries(schema)) out[k] = k === 'type' && typeof v === 'string' ? v.toUpperCase() : upperTypes(v);
  return out;
}
const toB64 = blob => new Promise((res, rej) => {
  const fr = new FileReader();
  fr.onload = () => res(String(fr.result).split(',')[1]);
  fr.onerror = rej;
  fr.readAsDataURL(blob);
});

export function geminiSample({ key, model }) {
  let chosen = (model || '').trim() || null;
  async function pickModel() {
    if (chosen) return chosen;
    try {
      const r = await fetch(`${API}/models?pageSize=1000`, { headers: { 'x-goog-api-key': key } });
      const j = await r.json();
      const names = (j.models || [])
        .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
        .map(m => m.name.replace(/^models\//, ''))
        .filter(n => /^gemini-\d+(\.\d+)?-flash$/.test(n))
        .sort((a, b) => parseFloat(b.split('-')[1]) - parseFloat(a.split('-')[1]));
      chosen = names[0] || 'gemini-2.5-flash';
    } catch (e) { chosen = 'gemini-2.5-flash'; }
    return chosen;
  }

  const sample = async (input, opts = {}) => {
    const m = await pickModel();
    const msgs = typeof input === 'string' ? [{ role: 'user', content: input }] : input;
    const contents = msgs.map(x => ({ role: x.role === 'assistant' ? 'model' : 'user', parts: [{ text: x.content }] }));
    if (opts.images && opts.images.length) {
      const last = contents[contents.length - 1];
      for (const img of opts.images) last.parts.push({ inline_data: { mime_type: img.type || 'image/jpeg', data: await toB64(img) } });
    }
    const tools = opts.tools && opts.tools.length
      ? [{ functionDeclarations: opts.tools.map(t => ({ name: t.name, description: t.description, parameters: upperTypes(t.inputSchema) })) }]
      : undefined;
    let text = '';
    for (let step = 0; step < 6; step++) {
      const r = await fetch(`${API}/models/${m}:generateContent`, {
        method: 'POST', signal: opts.signal,
        headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({ contents, tools })
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw { code: r.status === 429 ? 'rate_limited' : r.status === 400 || r.status === 403 ? 'bad_key' : 'error', message: (j.error && j.error.message) || String(r.status) };
      const content = j.candidates && j.candidates[0] && j.candidates[0].content;
      if (!content) break;
      contents.push(content);
      const parts = content.parts || [];
      const t = parts.filter(p => p.text && !p.thought).map(p => p.text).join('').trim();
      if (t) { text += (text ? '\n\n' : '') + t; if (opts.onText) opts.onText({ text, delta: t }); }
      const calls = parts.filter(p => p.functionCall);
      if (!calls.length) break;
      const responses = [];
      for (const c of calls) {
        const tool = (opts.tools || []).find(x => x.name === c.functionCall.name);
        let out;
        try { out = tool ? await tool.execute(c.functionCall.args || {}) : { error: 'Esa herramienta no existe.' }; }
        catch (e) { out = { error: String((e && e.message) || e) }; }
        responses.push({ functionResponse: { name: c.functionCall.name, response: out } });
      }
      contents.push({ role: 'user', parts: responses });
    }
    return { text, truncated: false, modelApplied: m };
  };
  sample.limits = async () => ({ images: true });
  return sample;
}
