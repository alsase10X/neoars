// Proveedor de promptfoo para la Agent API de Perplexity.
// Con una sola clave (PERPLEXITY_API_KEY) se prueban modelos de varias empresas:
// el modelo de cada columna se elige en promptfooconfig.yaml.
//
// No se le pasan herramientas, así que el modelo no busca en internet:
// responde solo con el prompt y la memoria de la pieza.
//
// El prompt llega montado por construir.js: el mensaje de sistema va como
// «instructions» y lo que dice el visitante, como «input».

const URL_API = process.env.PERPLEXITY_URL || 'https://api.perplexity.ai/v1/agent';

class Perplexity {
  constructor(opciones = {}) {
    this.config = opciones.config || {};
    this.idProveedor = opciones.id || 'perplexity';
    this.label = opciones.label;
  }

  id() {
    return `perplexity:${this.config.modelo || 'sin-modelo'}`;
  }

  async callApi(prompt) {
    const clave = process.env.PERPLEXITY_API_KEY;
    if (!clave) return { error: 'Falta PERPLEXITY_API_KEY en el archivo .env' };
    if (!this.config.modelo) return { error: 'Falta «modelo» en la configuración de este proveedor' };

    // construir.js devuelve [{role: 'system'}, {role: 'user'}]; promptfoo lo pasa como texto JSON
    let mensajes;
    try { mensajes = JSON.parse(prompt); } catch (e) { mensajes = [{ role: 'user', content: prompt }]; }
    if (!Array.isArray(mensajes)) mensajes = [{ role: 'user', content: String(prompt) }];
    const sistema = mensajes.filter(m => m.role === 'system').map(m => m.content).join('\n\n');
    const turnos = mensajes.filter(m => m.role !== 'system')
      .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));

    const cuerpo = {
      model: this.config.modelo,
      instructions: sistema || undefined,
      input: turnos,
      // Cuenta también lo que el modelo razona antes de escribir
      max_output_tokens: this.config.max_output_tokens || 1500,
    };
    if (this.config.razonar) cuerpo.reasoning = { effort: this.config.razonar };

    const pedir = (c) => fetch(URL_API, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + clave, 'Content-Type': 'application/json' },
      body: JSON.stringify(c),
    });

    let r;
    try {
      r = await pedir(cuerpo);
      // Si la API no acepta la conversación con papeles, la misma en un solo texto
      if (r.status === 400 || r.status === 422) {
        const texto = turnos.map(t => (t.role === 'assistant' ? 'Respuesta anterior: ' : '') + t.content).join('\n\n');
        r = await pedir({ ...cuerpo, input: texto });
      }
    } catch (e) {
      return { error: 'No se ha podido llamar a Perplexity: ' + e.message };
    }
    if (!r.ok) {
      const detalle = (await r.text()).slice(0, 400);
      return { error: `Perplexity ha respondido ${r.status}: ${detalle}` };
    }

    const j = await r.json();
    const salida = (j.output || []).filter(o => o && o.type === 'message')
      .flatMap(o => o.content || []).filter(c => c && c.type === 'output_text')
      .map(c => c.text).join('') || j.output_text || '';
    if (!salida) {
      return { error: 'Respuesta vacía (¿se le acabaron los tokens razonando?): ' + JSON.stringify({ estado: j.status, motivo: j.incomplete_details }).slice(0, 300) };
    }

    const uso = j.usage || {};
    return {
      output: salida,
      cost: uso.cost && typeof uso.cost.total_cost === 'number' ? uso.cost.total_cost : undefined,
      tokenUsage: {
        prompt: uso.input_tokens,
        completion: uso.output_tokens,
        total: (uso.input_tokens || 0) + (uso.output_tokens || 0),
      },
    };
  }
}

module.exports = Perplexity;
