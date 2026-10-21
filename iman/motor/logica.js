/* ======================= Utilidades ======================= */
const $ = id => document.getElementById(id);
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SENT = t => (t.match(/[^.!?…]+[.!?…»]+|[^.!?…]+$/g) || [t]).map(x => x.trim()).filter(Boolean);
const st = {get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }, set(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }};
function toast(m){ const t = $('toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 3400); }
const espera = ms => new Promise(r => setTimeout(r, ms));

/* Encuadre: qué parte de una obra cabe en una caja de W × H (la zona entera, y la imagen cubriendo la caja) */
function encaje(o, b, W, H){
  const bw = b[2]*o.iw, bh = b[3]*o.ih;
  const base = Math.max(W/o.iw, H/o.ih);
  const s = Math.min(Math.max(Math.min(W/bw, H/bh), base), base*2.6);
  const cx = (b[0] + b[2]/2)*o.iw, cy = (b[1] + b[3]/2)*o.ih;
  const tx = Math.min(0, Math.max(W - o.iw*s, W/2 - cx*s)), ty = Math.min(0, Math.max(H - o.ih*s, H/2 - cy*s));
  return {s, tx, ty};
}
const caraDe = o => o.encuadre || (() => { const m = Math.min(o.iw, o.ih); return [(o.iw - m)/2/o.iw, (o.ih - m)/2/o.ih, m/o.iw, m/o.ih]; })();

/* ======================= Diseño · pruebas y canal ======================= */
let DIS = {tema:'personaje', fondo:'retrato', botones:'redondeados', canal:'voz'};
try{ DIS = Object.assign(DIS, JSON.parse(st.get('am.iman.dis5') || '{}')); }catch(e){}
location.hash.slice(1).split('.').forEach(t => { if(t === 'texto' || t === 'voz') DIS.canal = t; });
const NOTA_CANAL = {
  texto:'Pensado para el imán, en casa. Lo preparado no cuesta nada; las preguntas libres pasarían por un modelo de texto, la API más barata.',
  voz:'Pensado para la sala y la calle. Lo preparado lleva su audio grabado de antemano; las preguntas libres pasarían por voz encadenada o en tiempo real, que es lo más caro.'
};
const texto = () => DIS.canal === 'texto';
function aplicarDiseno(){
  const r = document.documentElement;
  if(DIS.tema !== 'oscuro') r.dataset.tema = DIS.tema; else delete r.dataset.tema;
  r.dataset.botones = DIS.botones; $('app').dataset.canal = DIS.canal;
  $('app').dataset.fondo = (DIS.fondo === 'retrato' && !ARTE.linea) || (DIS.fondo === 'patron' && !ARTE.patron) ? (ARTE.linea ? 'retrato' : ARTE.patron ? 'patron' : 'liso') : DIS.fondo;
  [['fTema','tema'],['fFondo','fondo'],['fBot','botones'],['fCanal','canal']].forEach(([id, k]) => document.querySelectorAll('#' + id + ' [data-v]').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === DIS[k])));
  $('canalN').textContent = NOTA_CANAL[DIS.canal];
  $('iniN').textContent = texto() ? 'Para leer y escribir, sin sonido' : 'Con voz · sube el volumen · toca el imán para oírle';
  $('oPlay').setAttribute('aria-label', texto() ? 'Leer' : 'Escuchar');
  if(texto()){ $('askF').hidden = !U.empezada; $('app').classList.remove('escribiendo'); cerrarPanel(); }
  else if(!$('app').classList.contains('escribiendo')) $('askF').hidden = true;
  st.set('am.iman.dis5', JSON.stringify(DIS));
  if(U.obra) selloA(U.obra);
  estado();
}
[['fTema','tema'],['fFondo','fondo'],['fBot','botones'],['fCanal','canal']].forEach(([id, k]) => $(id).addEventListener('click', e => {
  const b = e.target.closest('[data-v]'); if(!b || DIS[k] === b.dataset.v) return;
  if(k === 'canal') callar();
  DIS[k] = b.dataset.v; aplicarDiseno();
  if(k === 'canal') toast(texto() ? 'Canal de texto: escribes y lees, sin sonido' : 'Canal de voz: hablas y escuchas');
}));

/* ======================= Estado ======================= */
const U = {tok:0, asked:new Set(), vistas:new Set(), obra:null, hablando:false, quien:null, empezada:false, vista:'inicio'};
const G = {voz:true, texto:true};

/* ======================= Pintar lo fijo ======================= */
$('nom').textContent = PERSONAJE.nombre; $('sub').textContent = PERSONAJE.sub;
$('hav').setAttribute('aria-label', PERSONAJE.corto); $('iniS').setAttribute('aria-label', 'Escuchar a ' + PERSONAJE.corto);
$('askI').placeholder = `Pregúntale a ${PERSONAJE.corto}…`; $('obraV').setAttribute('aria-label', `La obra, contada por ${PERSONAJE.corto}`); $('bQuien').textContent = PERSONAJE.corto;
$('iniS').innerHTML = imanSVG(); $('selloC').innerHTML = imanSVG(true); $('mini').innerHTML = imanSVG(true);
$('bSello').innerHTML = imanSVG(true); $('oSello').innerHTML = imanSVG(true); $('havC').innerHTML = imanSVG(true);
$('iniQ').textContent = PERSONAJE.portada; $('iniP').textContent = PERSONAJE.pregunta;
$('fDl').innerHTML = PERSONAJE.ficha.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join('');
$('fNota').textContent = PERSONAJE.nota;
const otroBtn = (p, pie) => `<button class="otro" type="button" data-pj="${p.id}"><span class="oa${p.recorte ? ' recorte' : ''}"><img src="${RUTA_I(p.avatar)}" alt=""></span><span>${esc(p.nombre)}${pie ? `<small>${esc(pie)}</small>` : ''}</span></button>`;
if(OTROS.length){
  $('otros').hidden = false; $('otros').innerHTML = OTROS.map(p => otroBtn(p, 'También en «' + EXPO.nombre + '»')).join('');
  $('expoM').hidden = false; $('expoL').innerHTML = OTROS.map(p => otroBtn(p, 'Habla con él y mira sus obras')).join('');
  $('expoT').textContent = 'En «' + EXPO.nombre + '»';
}
// Cambiar de personaje: en el repositorio, por la dirección; dentro de Claude, por el ancla de la página
function cambiarPersonaje(id){
  callar();
  if(DATOS.modo === 'repo'){ const q = new URLSearchParams(location.search); q.set('p', id); if(EXPO) q.set('e', EXPO.id); location.search = q.toString(); return; }
  try{ sessionStorage.setItem('am.iman.pj', id); }catch(e){}
  location.hash = id; location.reload();
}
document.addEventListener('click', e => { const b = e.target.closest('[data-pj]'); if(b) cambiarPersonaje(b.dataset.pj); });

function estado(){
  const p = $('pista');
  $('app').classList.toggle('hablaAhora', U.hablando);
  if(rec) return;
  if(U.hablando) p.textContent = U.quien === 'guia' ? 'Habla la guía del museo' : `Habla ${PERSONAJE.corto} · toca el sello para callarle`;
  else p.textContent = 'Pregunta con la voz o escribe';
}

/* ======================= Dos puertas: sus obras y hablar ======================= */
function irA(vista, op = {}){
  callar(); U.vista = vista;
  const app = $('app'); app.dataset.vista = vista; app.classList.toggle('charla', vista !== 'inicio');
  $('inicio').hidden = vista !== 'inicio'; $('tabs').hidden = vista === 'inicio';
  $('obrasV').hidden = vista !== 'obras';
  $('flujo').hidden = $('abajo').hidden = vista !== 'hablar';
  document.querySelectorAll('#tabs [data-vista]').forEach(b => b.setAttribute('aria-selected', b.dataset.vista === vista));
  if(vista === 'obras'){
    pintarMapa();
    if(!M.saludado){ M.saludado = true; burbuja(PERSONAJE.saludo); }
  }
  if(vista === 'hablar'){
    if(texto()) $('askF').hidden = false;
    if(op.obra) sobreObra(op.obra);
    else if(!U.empezada) empezar();
    else if(U.obra) selloA(U.obra);
  }
}
$('verB').onclick = () => irA('obras');
$('hablarB').onclick = () => irA('hablar');
$('tabs').addEventListener('click', e => { const b = e.target.closest('[data-vista]'); if(b && U.vista !== b.dataset.vista) irA(b.dataset.vista); });
// En la portada, tocar el imán le hace hablar (el navegador no deja sonar nada antes del primer toque)
$('iniS').onclick = () => {
  const el = $('iniP'); el.innerHTML = '';
  const fs = trocear(PERSONAJE.pregunta, el, 'autor'); fs.forEach(f => { f.sello = $('iniS'); f.noSeguir = true; });
  el.classList.add('narrando'); narrar(fs, () => el.classList.remove('narrando'));
};

/* ======================= El sello de la conversación: su cara, o la obra de la que habla ======================= */
// Voz: el sello de abajo. Texto: su cara en la cabecera. Los dos pasan al cuadro del que habla
function encuadrar(s, img, k, z, def){
  if(!k){ s.classList.remove('enObra'); return; }
  const o = OBRAS[k];
  if(img.dataset.obra !== k){ img.src = o.img; img.style.width = o.iw + 'px'; img.style.height = o.ih + 'px'; img.dataset.obra = k; img.style.transition = 'none'; }
  const S = s.querySelector('.lien').getBoundingClientRect().width || def;
  const e = encaje(o, z && o.zonas ? o.zonas[z].b : caraDe(o), S, S);
  img.style.transform = `translate(${e.tx}px,${e.ty}px) scale(${e.s})`;
  void img.offsetWidth; img.style.transition = '';
  s.classList.add('enObra');
}
function selloA(k, z){ encuadrar($('sello'), $('selloImg'), k, z, 140); encuadrar($('hav'), $('havImg'), k, z, 40); }
const mirarA = selloA;
function quienEnSello(q){ $('mini').classList.toggle('guia', q === 'guia'); }

/* ======================= Palabras que se encienden ======================= */
function apagarAnteriores(){
  $('lineas').querySelectorAll('.ahora').forEach(el => { el.classList.remove('ahora'); el.classList.add('ya'); });
  $('lineas').querySelectorAll('.ep:not(.ya),.you:not(.ya),.qn:not(.ya),.verla:not(.ya)').forEach(el => el.classList.add('ya'));
}
function alTope(el){ if(!el) return; const F = $('flujo'); F.scrollTo({top:Math.max(0, el.offsetTop - F.clientHeight*.1), behavior:RM ? 'auto' : 'smooth'}); }
function seguir(w){ if(!w) return; const F = $('flujo'), r = w.getBoundingClientRect(), t = F.getBoundingClientRect(); if(r.bottom > t.top + t.height*.58) F.scrollBy({top:r.bottom - (t.top + t.height*.42), behavior:RM ? 'auto' : 'smooth'}); }
function trocear(txt, el, voz){
  const p = document.createElement('p'), ws = txt.trim().split(/\s+/);
  p.innerHTML = ws.map(w => `<span class="w">${esc(w)}</span>`).join(' ');
  el.appendChild(p);
  const spans = [...p.querySelectorAll('.w')], frases = []; let k = 0;
  SENT(txt).forEach(f => { const n = f.split(/\s+/).filter(Boolean).length; frases.push({t:f.replace(/[«»]/g, ''), voz, w:spans.slice(k, k + n)}); k += n; });
  if(k < spans.length && frases.length) frases[frases.length - 1].w.push(...spans.slice(k));
  return frases;
}
function latido(el){ if(RM) return; const s = el || (texto() ? $('hav') : $('sello')); s.classList.remove('late'); void s.getBoundingClientRect(); s.classList.add('late'); }
function encender(f, n){
  const ws = f.w.slice(0, n == null ? f.w.length : n); let nuevas = 0;
  ws.forEach(w => { if(!w.classList.contains('on')){ w.classList.add('on'); nuevas++; } });
  if(nuevas && n != null) latido(f.sello);
  if(!f.noSeguir) seguir(ws[ws.length - 1]);
}

/* ======================= La voz (o, en el canal de texto, la lectura) ======================= */
function vozPara(k){
  let vs = []; try{ vs = (speechSynthesis.getVoices() || []).filter(x => /^es/i.test(x.lang)); }catch(e){}
  if(!vs.length) return null;
  const fem = /m[oó]nica|paulina|marisol|luc[ií]a|elvira|helena|laura|sabina|paloma|conchita|marta|isabel|female|mujer/i, mas = /jorge|diego|juan|pablo|carlos|enrique|miguel|[aá]lvaro|ra[uú]l|male|hombre/i;
  const quiere = PERSONAJE.voces[k].fem ? fem : mas;
  return vs.find(v => quiere.test(v.name) && /es-ES/i.test(v.lang)) || vs.find(v => quiere.test(v.name)) || vs.find(v => /es-ES/i.test(v.lang)) || vs[0];
}
try{ speechSynthesis.getVoices(); }catch(e){}
let reloj = 0;
// lectura: a qué ritmo aparecen las palabras sin voz (más lento en los subtítulos de una obra, que hay que poder leer)
function decirFrase(f, tok, fin){
  clearInterval(reloj);
  const vd = PERSONAJE.voces[f.voz] || PERSONAJE.voces.autor, ms = texto() ? (f.lectura || 55) : 60000/(165*vd.rate);
  let n = 0, conLimites = false, hecho = false, empezo = false, wd = 0;
  const tictac = () => { clearInterval(reloj); reloj = setInterval(() => { if(tok !== U.tok || conLimites){ clearInterval(reloj); return; } n = Math.min(f.w.length - 1, n + 1); encender(f, n + 1); }, ms); };
  const acabar = () => { if(hecho || tok !== U.tok) return; hecho = true; clearTimeout(wd); clearInterval(reloj); fin(); };
  const sinVoz = () => { tictac(); clearTimeout(wd); wd = setTimeout(acabar, f.w.length*ms + (texto() ? 120 : 500)); };
  encender(f, 1);
  if(texto() || !G.voz || !window.speechSynthesis) return sinVoz();
  try{
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(f.t); u.lang = 'es-ES'; u.rate = vd.rate; u.pitch = vd.pitch;
    const v = vozPara(f.voz || 'autor'); if(v) u.voice = v;
    u.onboundary = e => { if(tok !== U.tok || (e.name && e.name !== 'word')) return; conLimites = true; n = f.t.slice(0, e.charIndex + 1).split(/\s+/).filter(Boolean).length; encender(f, n); };
    u.onstart = () => { empezo = true; clearTimeout(wd); wd = setTimeout(acabar, f.w.length*ms*2.5 + 4000); setTimeout(() => { if(!conLimites && tok === U.tok) tictac(); }, 500); };
    u.onend = acabar;
    u.onerror = e => { if(e.error === 'interrupted' || e.error === 'canceled') return; sinVoz(); };
    wd = setTimeout(() => { if(!empezo && tok === U.tok) sinVoz(); }, 1800);
    speechSynthesis.speak(u);
  }catch(e){ sinVoz(); }
}
// Frases seguidas, fuera de la conversación (la burbuja del mapa, la portada, los subtítulos de una obra)
function narrar(frases, fin, tok = ++U.tok){
  let k = 0;
  const next = () => {
    if(tok !== U.tok) return;
    if(k >= frases.length){ if(fin) fin(); return; }
    const f = frases[k]; if(f.antes) f.antes();
    decirFrase(f, tok, () => { if(tok !== U.tok) return; encender(f); k++; setTimeout(next, texto() ? 70 : 180); });
  };
  next();
  return tok;
}
// Cuando la voz llega a una frase que nombra un detalle, el sello se acerca a él
function alLlegar(f){ if(f.obra) mirarA(f.obra, f.z || null); }
function hablar(frases, quien, fin){
  const tok = ++U.tok, L = $('lineas'); L.classList.add('hablando'); U.hablando = true; U.quien = quien; quienEnSello(quien); estado();
  let k = 0;
  const cerrar = () => { L.classList.remove('hablando'); U.hablando = false; estado(); if(U.obra) mirarA(U.obra); if(fin) fin(); };
  const next = () => {
    if(tok !== U.tok) return;
    if(k >= frases.length) return cerrar();
    const f = frases[k]; alLlegar(f);
    decirFrase(f, tok, () => { if(tok !== U.tok) return; encender(f); k++; setTimeout(next, texto() ? 70 : 180); });
  };
  next();
}
function callar(){
  U.tok++; clearInterval(reloj); try{ speechSynthesis.cancel(); }catch(e){}
  document.querySelectorAll('#lineas .ahora .w, .narrando .w').forEach(w => w.classList.add('on'));
  document.querySelectorAll('.narrando').forEach(el => el.classList.remove('narrando'));
  $('lineas').classList.remove('hablando'); U.hablando = false;
  if(O.k && O.playing){ O.playing = false; iconoPlay(); }
  estado();
}

/* ======================= Sus obras: el mapa de su vida ======================= */
const M = {filtro:'empezar', epoca:-1, saludado:false, drag:null, movido:0, t:0};
function chips(){
  const all = [{id:'empezar', titulo:'Para empezar'}, {id:'', titulo:'Toda su obra'}].concat(SELECCIONES);
  $('chips').innerHTML = all.map(s => `<button class="chip" type="button" data-sel="${s.id}" aria-pressed="${(M.filtro || '') === s.id}">${esc(s.titulo)}</button>`).join('');
}
$('chips').addEventListener('click', e => {
  const b = e.target.closest('[data-sel]'); if(!b) return;
  M.filtro = b.dataset.sel || null; chips(); pintarMapa(); $('mapa').scrollTo({left:0, behavior:'auto'});
  const s = SELECCIONES.find(x => x.id === M.filtro);
  burbuja(s ? s.dice : M.filtro === 'empezar' ? PERSONAJE.saludo : PERSONAJE.saludoTodo);
  M.epoca = -1;
});
function pintarMapa(){
  chips();
  const mapa = $('mapa'), L = $('lienzo'), cartas = M.filtro === 'empezar';
  mapa.classList.toggle('cartas', cartas); L.classList.toggle('cartas', cartas);
  // Para empezar: pocas obras grandes, cada una con su frase
  if(cartas){
    L.style.width = '';
    L.innerHTML = EMPEZAR.map(({k, gancho}) => { const o = OBRAS[k]; return `<button class="carta" type="button" data-k="${k}" aria-label="${esc(o.titulo)}"><span class="ci"><img src="${o.img}" alt="" loading="lazy" draggable="false">${tieneVisita(o) ? '<span class="pl" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5l12 7-12 7z"/></svg></span>' : ''}</span><span class="cx"><b>${esc(o.titulo)}</b><small>${esc(o.fecha)}</small><span class="cg">«${esc(gancho)}»</span></span></button>`; }).join('');
    return;
  }
  const H = mapa.clientHeight || 420, banda = 30, gap = 10;
  const lista = M.filtro ? ORDEN.filter(o => SELECCIONES.find(s => s.id === M.filtro).obras.includes(o.k)) : ORDEN;
  const carriles = Math.max(1, Math.min(4, Math.floor((H - banda)/150)));
  const th = (H - banda - 8 - gap*(carriles - 1))/carriles;
  const xs = Array(carriles).fill(16), hitos = []; let ep = -2, html = '';
  lista.forEach(o => {
    const w = Math.round(Math.max(th*.62, Math.min(th*1.55, th*o.iw/o.ih)));
    let c = 0; xs.forEach((x, i) => { if(x < xs[c]) c = i; });
    const e = epocaDe(o);
    if(e !== ep){ hitos.push({e, x:xs[c]}); ep = e; }
    const x = xs[c], y = banda + c*(th + gap);
    html += `<button class="tile${o.propia ? ' propia' : ''}" type="button" data-k="${o.k}" data-ep="${e}" style="left:${x}px;top:${y}px;width:${w}px;height:${Math.round(th)}px" aria-label="${esc(o.titulo)}, ${esc(o.fecha)}"><img src="${o.th}" alt="" loading="lazy" draggable="false"><span class="tt">${esc(o.titulo)}</span>${tieneVisita(o) ? '<span class="pl" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5l12 7-12 7z"/></svg></span>' : ''}</button>`;
    xs[c] = x + w + gap;
  });
  html += hitos.map(h => `<span class="hito" style="left:${h.x}px">${esc(EPOCAS[h.e] ? EPOCAS[h.e].titulo : '')}</span>`).join('');
  L.innerHTML = html; L.style.width = (Math.max(...xs) + 16) + 'px';
}
// Al parar de arrastrar, comenta la época que queda en el centro
function alParar(){
  if(M.filtro || U.vista !== 'obras') return;
  const mapa = $('mapa'), cx = mapa.scrollLeft + mapa.clientWidth/2;
  let best = null, d = 1e9;
  $('lienzo').querySelectorAll('.tile').forEach(t => { const x = t.offsetLeft + t.offsetWidth/2, dd = Math.abs(x - cx); if(dd < d){ d = dd; best = t; } });
  if(!best) return; const e = +best.dataset.ep;
  if(e === M.epoca || !EPOCAS[e]) return;
  M.epoca = e; burbuja(EPOCAS[e].dice, EPOCAS[e].titulo);
}
$('mapa').addEventListener('scroll', () => { clearTimeout(M.t); M.t = setTimeout(alParar, 380); }, {passive:true});
// Con ratón, arrastrar el mapa; con el dedo, el desplazamiento nativo
$('mapa').addEventListener('pointerdown', e => { if(e.pointerType !== 'mouse') return; M.drag = {x:e.clientX, l:$('mapa').scrollLeft}; M.movido = 0; $('mapa').classList.add('arrastra'); });
addEventListener('pointermove', e => { if(!M.drag) return; const dx = e.clientX - M.drag.x; M.movido = Math.max(M.movido, Math.abs(dx)); $('mapa').scrollLeft = M.drag.l - dx; });
addEventListener('pointerup', () => { if(!M.drag) return; M.drag = null; $('mapa').classList.remove('arrastra'); });
$('lienzo').addEventListener('click', e => {
  const t = e.target.closest('[data-k]'); if(!t) return;
  if(M.movido > 6){ M.movido = 0; return; }
  abrirObra(t.dataset.k, {play:true});
});
function burbuja(txt, quien){
  const el = $('bTxt'); el.innerHTML = ''; $('bQuien').textContent = quien ? `${PERSONAJE.corto} · ${quien}` : PERSONAJE.corto;
  const fs = trocear(txt, el, 'autor'); fs.forEach(f => { f.sello = $('bSello'); f.noSeguir = true; });
  const caja = $('burbuja'); caja.classList.add('narrando');
  narrar(fs, () => caja.classList.remove('narrando'));
}

/* ======================= Una obra a pantalla completa, contada por él ======================= */
const O = {k:null, partes:[], i:0, playing:false};
function partesDe(o){
  if(o.visitaQA) return o.visitaQA.flatMap(id => QI[id].partes.map(p => Object.assign({}, p)));
  if(!o.visita) return [];
  return o.visita.flatMap(p => p.c && o.citas && o.citas[p.c] ? [{t:p.t}, {cl:o.citas[p.c]}] : [{t:p.t}]);
}
function camara(z, anim = true){
  const o = OBRAS[O.k], img = $('oImg'), r = $('oCu').getBoundingClientRect(), W = r.width, H = r.height;
  const s0 = Math.min(W/o.iw, H/o.ih)*.94;
  let s = s0, cx = o.iw/2, cy = o.ih/2;
  if(z === 'kb'){ s = s0*1.16; cy = o.ih*.45; }
  else if(z && o.zonas && o.zonas[z]){ const b = o.zonas[z].b; s = Math.min(Math.min(W/(b[2]*o.iw), H/(b[3]*o.ih))*.86, s0*3.2); s = Math.max(s, s0); cx = (b[0] + b[2]/2)*o.iw; cy = (b[1] + b[3]/2)*o.ih; }
  const lim = (t, V, I) => I*s > V ? Math.min(0, Math.max(V - I*s, t)) : (V - I*s)/2;
  const tx = lim(W/2 - cx*s, W, o.iw), ty = lim(H/2 - cy*s, H, o.ih);
  if(!anim) img.style.transition = 'none';
  img.style.transform = `translate(${tx}px,${ty}px) scale(${s})`;
  if(!anim){ void img.offsetWidth; img.style.transition = ''; }
}
function iconoPlay(){
  const fin = O.k && O.i >= O.partes.length && O.partes.length;
  $('oPlayI').setAttribute('d', O.playing ? 'M7 5h4v14H7zM13 5h4v14h-4z' : fin ? 'M4 12a8 8 0 1 0 2.4-5.7M4 4v5h5' : 'M8 5l12 7-12 7z');
  $('oPlay').classList.toggle('vuelve', !O.playing && !!fin);
  $('oPlay').setAttribute('aria-label', O.playing ? 'Pausa' : fin ? 'Otra vez' : texto() ? 'Leer' : 'Escuchar');
}
// Sugerencias para preguntarle sin salir de la obra: primero las de este cuadro, si no, las de su forma de pintar
function sugObra(){
  if(!O.k){ $('oSug').innerHTML = ''; return; }
  const libres = QA.filter(x => !U.asked.has(x.q));
  let s = libres.filter(x => x.obra === O.k && !x.abre);
  if(s.length < 2) s = s.concat(libres.filter(x => x.sola && x.obra !== O.k && !s.includes(x)));
  $('oSug').innerHTML = s.slice(0, 2).map(x => `<button class="q" type="button" data-oq="${x.id}">${esc(x.q)}</button>`).join('');
}
function abrirObra(k, op = {}){
  callar(); cerrarPreg();
  const o = OBRAS[k]; O.k = k; O.partes = partesDe(o); O.i = 0; O.playing = false; U.vistas.add(k);
  const img = $('oImg'); img.src = o.img; img.style.width = o.iw + 'px'; img.style.height = o.ih + 'px'; img.alt = `${o.titulo}, de ${PERSONAJE.nombre}`;
  $('oTit').textContent = o.titulo; $('oSub').textContent = `${o.fecha} · ${o.museo}`;
  $('obraV').hidden = false; camara(null, false);
  $('oPlay').hidden = !O.partes.length;
  $('oSubt').innerHTML = O.partes.length
    ? `<p class="nada">${texto() ? 'Toca y te lo cuento.' : 'Toca y te lo cuento. Sube el volumen.'}</p>`
    : `<p class="nada">Este todavía no te lo sé contar. Míralo con calma: a veces basta con mirar. Y si quieres, pregúntame.</p>`;
  iconoPlay(); sugObra();
  if(op.play && O.partes.length) setTimeout(() => { if(O.k === k) contarObra(); }, 450);
}
// Una parte en los subtítulos: la escribe, mueve la cámara y la dice
async function decirParte(p, voz, tok, i){
  const o = OBRAS[O.k], S = $('oSubt');
  S.innerHTML = ''; S.classList.add('narrando');
  if(p.qn) S.insertAdjacentHTML('beforeend', `<p class="oqn">${esc(p.qn)}</p>`);
  let fs;
  if(p.c || p.cl){ const C = p.cl || CITAS[p.c], bq = document.createElement('blockquote'); fs = trocear('«' + C.t + '»', bq, voz); S.appendChild(bq); }
  else fs = trocear(p.t, S, voz);
  camara(p.z && o.zonas ? p.z : (o.zonas ? null : (i % 2 ? 'kb' : null)));
  fs.forEach(f => { f.sello = $('oSello'); f.noSeguir = true; f.lectura = 120; });
  await new Promise(r => narrar(fs, () => r(true), tok));
  if(tok !== U.tok) return false;
  S.classList.remove('narrando');
  const nw = fs.reduce((a, f) => a + f.w.length, 0);
  await espera(texto() ? Math.min(4200, 600 + nw*140) : 500);
  return tok === U.tok;
}
async function contarObra(){
  cerrarPreg();
  if(O.i >= O.partes.length) O.i = 0;
  const tok = ++U.tok; clearInterval(reloj); try{ speechSynthesis.cancel(); }catch(e){}
  O.playing = true; iconoPlay(); $('oSug').innerHTML = '';
  const o = OBRAS[O.k];
  while(O.i < O.partes.length){
    if(!await decirParte(O.partes[O.i], 'autor', tok, O.i)) return;
    O.i++;
  }
  // Al terminar: la obra entera, una pregunta para mirar y la siguiente
  O.playing = false; camara(null); iconoPlay(); sugObra();
  const sig = ORDEN[(ORDEN.findIndex(x => x.k === O.k) + 1) % ORDEN.length];
  $('oSubt').innerHTML = `${o.mira ? `<p class="eyb">Para mirar</p><p class="mira">${esc(o.mira)}</p>` : ''}<button class="lk sig" type="button" data-sig="${sig.k}">Siguiente: ${esc(sig.titulo)} →</button>`;
}
// Preguntarle sin salir de la obra: la respuesta va a los subtítulos y la cámara se acerca a lo que nombra
async function responderEnObra(q, x){
  cerrarPreg(); callar();
  const tok = ++U.tok; $('oSug').innerHTML = '';
  const o = OBRAS[O.k];
  let partes, guia = null;
  if(x){
    U.asked.add(x.q);
    partes = x.partes.map(p => Object.assign({}, p, {z:x.obra === O.k ? p.z : null}));
    if(x.pasa) guia = x.pasa.partes.map(p => Object.assign({}, p, {z:x.obra === O.k ? p.z : null}));
  } else partes = [{t:'Uf, de eso no me acuerdo bien. Prueba con alguna de estas, o sigue mirando.'}];
  partes[0] = Object.assign({}, partes[0], {qn:q});
  O.playing = true; iconoPlay();
  for(let i = 0; i < partes.length; i++) if(!await decirParte(partes[i], 'autor', tok, i)) return;
  if(guia) for(let i = 0; i < guia.length; i++) if(!await decirParte(Object.assign({}, guia[i], i ? {} : {qn:PERSONAJE.guia.nombre}), 'guia', tok, i)) return;
  O.playing = false; iconoPlay(); camara(null); sugObra();
  $('oSubt').innerHTML = `<p class="nada">${O.partes.length && O.i < O.partes.length ? 'Toca para seguir con el cuadro, o pregúntame otra cosa.' : 'Pregúntame otra cosa, o sigue mirando.'}</p>`;
}
function preguntarEnObra(q){
  const exacta = QA.find(x => normal(x.q) === normal(q));
  if(exacta) return responderEnObra(q, exacta);
  const prev = U.obra; U.obra = O.k; const r = ranking(q); U.obra = prev;
  responderEnObra(q, r.length && r[0].s >= .34 ? r[0].x : null);
}
function abrirPreg(){
  callar();
  if(!texto() && SR){
    try{
      rec = new SR(); rec.lang = 'es-ES'; rec.interimResults = false;
      rec.onstart = () => { $('oPreg').classList.add('rec'); $('oPreg').firstChild.textContent = 'Te escucho… '; };
      rec.onend = () => { $('oPreg').classList.remove('rec'); $('oPreg').firstChild.textContent = 'Preguntarle '; rec = null; };
      rec.onerror = ev => { if(['not-allowed','service-not-allowed','audio-capture','network'].includes(ev.error)) escribirEnObra(); };
      rec.onresult = ev => { const q = (ev.results[0][0].transcript || '').trim(); if(q) preguntarEnObra(q); };
      rec.start(); return;
    }catch(e){ rec = null; }
  }
  escribirEnObra();
}
function escribirEnObra(){ $('obraV').classList.add('preguntando'); $('oAskF').hidden = false; setTimeout(() => $('oAskI').focus(), 30); }
function cerrarPreg(){ $('obraV').classList.remove('preguntando'); $('oAskF').hidden = true; $('oAskI').blur(); }
$('oAskF').onsubmit = e => { e.preventDefault(); const q = $('oAskI').value.trim(); if(!q) return; $('oAskI').value = ''; preguntarEnObra(q); };
$('oAskC').onclick = cerrarPreg;
$('oSug').addEventListener('click', e => { const b = e.target.closest('[data-oq]'); if(b){ const x = QI[b.dataset.oq]; responderEnObra(x.q, x); } });
$('oSubt').addEventListener('click', e => {
  const b = e.target.closest('[data-sig]'); if(b) return abrirObra(b.dataset.sig, {play:true});
  if(!O.playing && O.partes.length && O.i < O.partes.length) contarObra();
});
$('oPlay').onclick = () => { if(O.playing) callar(); else contarObra(); };
function cerrarObra(){ callar(); cerrarPreg(); $('obraV').hidden = true; O.k = null; }
$('oAtras').onclick = cerrarObra;
$('oPreg').onclick = abrirPreg;

/* ======================= La conversación ======================= */
function arrancarChat(){
  U.empezada = true;
  if(texto()) $('askF').hidden = false;
}
function empezar(){
  arrancarChat(); selloA(null);
  const box = document.createElement('div'); box.className = 'cap ahora firmada'; box.innerHTML = `<span class="cav">${imanSVG(true)}</span>`;
  const frases = PERSONAJE.intro.flatMap(t => trocear(t, box, 'autor'));
  $('lineas').appendChild(box);
  const primeras = PERSONAJE.primeras.map(id => QI[id]);
  box.insertAdjacentHTML('beforeend', `<p class="qin-t">Por ejemplo, pregúntame:</p><div class="qin">${primeras.map(x => `<button class="q" type="button" data-q="${x.id}">${esc(x.q)}</button>`).join('')}</div>`);
  hablar(frases, 'autor');
}
// Se llega a Hablar desde una obra: la conversación empieza (o sigue) sobre ella
function sobreObra(k){
  const o = OBRAS[k], tiene = QA.some(x => x.obra === k);
  if(!U.empezada) arrancarChat(); else apagarAnteriores();
  $('lineas').querySelectorAll('.sug').forEach(s => s.remove());
  U.obra = k; U.vistas.add(k); selloA(k);
  $('lineas').insertAdjacentHTML('beforeend', `<p class="qn">Sobre ${esc(o.titulo)}</p>`);
  const box = document.createElement('div'); box.className = 'cap ahora firmada'; box.innerHTML = `<span class="cav">${imanSVG(true)}</span>`;
  const frases = trocear(`Hablemos de ${o.titulo}. Pregúntame lo que quieras de este cuadro.`, box, 'autor');
  frases.forEach(f => { f.obra = k; });
  $('lineas').appendChild(box); alTope(box);
  sugerencias(null, true);
  hablar(frases, 'autor', () => sugerencias());
}
// Sugerencias de Hablar: su vida y sus ideas, no sus cuadros (esos están en «Sus obras»).
// Solo si la conversación ya va sobre un cuadro, primero lo que queda de ese cuadro
const disponible = x => !U.asked.has(x.q) && (!x.obra || x.abre || x.sola || U.vistas.has(x.obra));
function elegir(){
  const libres = QA.filter(x => disponible(x) && !x.abre), out = [];
  const add = x => { if(x && out.length < 3 && !out.includes(x)) out.push(x); };
  if(U.obra) libres.filter(x => x.obra === U.obra && x.d !== 'fuera').slice(0, 2).forEach(add);
  // Lo de hoy y «¿quién eres?» van al final: primero su vida
  const vida = libres.filter(x => x.d === 'fuera').sort((a, b) => (/^G[78]$/.test(a.id) ? 1 : 0) - (/^G[78]$/.test(b.id) ? 1 : 0));
  vida.slice(0, 2).forEach(add);
  add(libres.find(x => x.sola && x.d === 'obra') || libres.find(x => x.sola));
  vida.forEach(add);
  return out;
}
function sugerencias(lista, mudas){
  $('lineas').querySelectorAll('.sug').forEach(s => s.remove());
  const s = (lista || elegir()).filter(x => !U.asked.has(x.q)).slice(0, 3);
  if(!s.length) return;
  const box = document.createElement('div'); box.className = 'sug';
  box.innerHTML = `<p class="eyb">Puedes preguntarle</p>` + s.map(x => `<button class="q" type="button" data-q="${x.id}">${esc(x.q)}</button>`).join('');
  $('lineas').appendChild(box);
  if(!mudas) setTimeout(() => box.scrollIntoView({block:'nearest', behavior:RM ? 'auto' : 'smooth'}), 250);
}
const etiqueta = ep => `<p class="ep ep-${ep[0]}"><b>${esc(ep[1])}</b> · ${esc(ep[2])}</p>`;
function encabezar(q){
  callar(); apagarAnteriores();
  $('lineas').querySelectorAll('.qin .q').forEach(b => { if(U.asked.has(QI[b.dataset.q].q)) b.classList.add('hecha'); });
  $('lineas').querySelectorAll('.sug').forEach(s => s.remove());
  const y = document.createElement('p'); y.className = 'you'; y.textContent = q; $('lineas').appendChild(y);
  const dots = document.createElement('div'); dots.className = 'dots'; dots.setAttribute('aria-label', 'Pensando'); dots.innerHTML = '<i></i><i></i><i></i>'; $('lineas').appendChild(dots);
  alTope(y);
  return dots;
}
// La obra no entra en la conversación: la primera vez que habla de ella, deja un enlace para verla con él
const enlaceObra = k => { const o = OBRAS[k]; return `<button class="verla" type="button" data-ver="${k}"><img src="${o.th}" alt=""><span>Ver ${esc(o.titulo)} con él</span><span aria-hidden="true">→</span></button>`; };
function decir(partes, quien, ep, k, despues){
  const L = $('lineas');
  const box = document.createElement('div'); box.className = 'ans ahora';
  let frases = [];
  partes.forEach(p => {
    let fs;
    if(p.c){
      const C = CITAS[p.c], w = document.createElement('div'), bq = document.createElement('blockquote');
      fs = trocear('«' + C.t + '»', bq, quien); w.appendChild(bq);
      box.appendChild(w);
    } else fs = trocear(p.t, box, quien);
    fs.forEach(f => { f.obra = k || null; f.z = p.z || null; });
    frases = frases.concat(fs);
  });
  L.appendChild(box);
  if(k && !U.vistas.has(k)){ L.insertAdjacentHTML('beforeend', enlaceObra(k)); U.vistas.add(k); }
  U.obra = k || null;
  mirarA(k || null);
  hablar(frases, quien, despues);
}
function responder(x, eco){
  U.asked.add(x.q);
  const dots = encabezar(eco || x.q), tok = U.tok;
  setTimeout(() => {
    if(tok !== U.tok) return; dots.remove();
    decir(x.partes, 'autor', x.ep, x.obra, () => {
      const o = x.otro && OTROS.find(p => p.id === x.otro);
      if(o) $('lineas').insertAdjacentHTML('beforeend', `<button class="verla otro" type="button" data-pj="${o.id}"><span class="oa${o.recorte ? ' recorte' : ''}"><img src="${RUTA_I(o.avatar)}" alt=""></span><span>Hablar con ${esc(o.nombre)}</span><span aria-hidden="true">→</span></button>`);
      if(x.pasa){ const b = document.createElement('div'); b.className = 'sug'; b.innerHTML = `<button class="pasar" type="button" data-pasa="${x.id}">Preguntar a la guía →</button>`; $('lineas').appendChild(b); setTimeout(() => b.scrollIntoView({block:'nearest', behavior:RM ? 'auto' : 'smooth'}), 250); }
      else sugerencias();
    });
  }, texto() ? 380 : 520);
}
// Lo que el autor ya no vivió lo cuenta la guía
function pasarALaGuia(id){
  const x = QI[id]; callar(); apagarAnteriores();
  $('lineas').querySelectorAll('.sug').forEach(s => s.remove());
  $('lineas').insertAdjacentHTML('beforeend', `<p class="qn">${esc(PERSONAJE.guia.nombre)}</p>`);
  decir(x.pasa.partes, 'guia', x.pasa.ep, x.obra, () => sugerencias());
}
function sinPreparada(q, cercanas){
  const dots = encabezar(q), tok = U.tok;
  setTimeout(() => {
    if(tok !== U.tok) return; dots.remove();
    decir([{t:'Uf, de eso no me acuerdo bien. Prueba con alguna de estas.'}], 'autor', ['sin','Sin respuesta preparada','En esta maqueta no hay modelo de IA'], U.obra, () => sugerencias(cercanas.length ? cercanas : null));
  }, 520);
}

/* ======================= Preguntas libres: se comparan con el banco ======================= */
const STOP = new Set(('a al algo alguien algun alguna ante antes asi aun bien cada como con contra cual cuales cuando cuanto cuanta cuantos cuantas '
  + 'de del desde donde dos el ella ellas ello ellos en entre era eran es esa esas ese eso esos esta estaba estan estas este esto estos fue fueron '
  + 'ha habia han has hay he hemos la las le les lo los mas me mi mis mucho muy nada ni no nos o os para pero por porque puede pueden puedes podria podrias '
  + 'que quien quienes se ser si sido sin sobre son su sus tambien tan tanto te tenia tiene tienen ti tu tus un una uno unos unas usted y ya yo '
  + 'oye bueno dime cuentame explicame hablame sabes saber quiero quisiera gustaria hola gracias aqui ahi alli cosa cosas '
  + PERSONAJE.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')).split(' '));
const normal = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const raiz = w => w.length >= 5 ? w.slice(0, 5) : w.replace(/s$/, '');
const toks = s => [...new Set(normal(s).split(' ').filter(w => (w.length > 2 || w === 'ia') && !STOP.has(w)).map(raiz))];
const BANCO = (() => {
  const docs = QA.map(x => ({x, q:toks(x.q + ' ' + (x.k || '')), a:toks(x.partes.map(p => p.t || '').join(' '))}));
  const df = {}; docs.forEach(d => new Set([...d.q, ...d.a]).forEach(t => { df[t] = (df[t] || 0) + 1; }));
  return {docs, df, N:docs.length};
})();
// Cada palabra pesa más cuanto más rara es; cuenta entera si está en la pregunta o sus palabras. Ayuda estar hablando de esa obra
function ranking(q){
  const T = toks(q), B = BANCO, nq = normal(q); if(!T.length) return [];
  const idf = t => Math.log(1 + B.N/B.df[t]);
  const den = T.reduce((a, t) => a + (B.df[t] ? idf(t) : .3), 0);
  return B.docs.map(d => {
    let s = 0, ancla = false;
    T.forEach(t => { if(!B.df[t]) return; const w = d.q.includes(t) ? 1 : d.a.includes(t) ? .3 : 0; if(w === 1) ancla = true; s += w*idf(t); });
    const bono = d.x.f && d.x.f.split('|').some(f => nq.includes(f)) ? 1 : 0;
    const aqui = ancla && U.obra && d.x.obra === U.obra ? .12 : 0;
    return {x:d.x, s:(ancla ? s/den : 0) + bono + aqui};
  }).filter(r => r.s > 0).sort((a, b) => b.s - a.s);
}
function preguntar(q){
  cerrarPanel();
  const exacta = QA.find(x => normal(x.q) === normal(q));
  if(exacta) return responder(exacta);
  const r = ranking(q);
  if(r.length && r[0].s >= .34) return responder(r[0].x, q);
  sinPreparada(q, r.slice(0, 3).map(y => y.x).filter(disponible));
}

/* ======================= Mandos de la conversación ======================= */
$('lineas').addEventListener('click', e => {
  const b = e.target.closest('[data-q],[data-pasa],[data-ver]'); if(!b) return;
  if(b.dataset.ver) return abrirObra(b.dataset.ver, {play:true});
  if(b.dataset.pasa) return pasarALaGuia(b.dataset.pasa);
  responder(QI[b.dataset.q]);
});
$('hav').onclick = () => { if(U.hablando) callar(); else if(U.obra) abrirObra(U.obra, {play:false}); };
$('sello').onclick = () => { if(U.hablando) callar(); else if(U.obra) abrirObra(U.obra, {play:false}); else toast(texto() ? 'Escríbele abajo.' : 'Pregúntale con el micrófono o escribe.'); };
function abrirEscribir(){ cerrarPanel(); $('app').classList.add('escribiendo'); $('askF').hidden = false; setTimeout(() => $('askI').focus(), 30); }
function cerrarEscribir(){ if(texto()) return; $('app').classList.remove('escribiendo'); $('askF').hidden = true; $('askI').blur(); }
$('kb').onclick = abrirEscribir;
$('cancelar').onclick = cerrarEscribir;
$('askF').onsubmit = e => { e.preventDefault(); const q = $('askI').value.trim(); if(!q) return; $('askI').value = ''; if(texto()) $('askI').blur(); cerrarEscribir(); preguntar(q); };
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null;
function sinMicro(){ toast('El micrófono no funciona en esta vista. Escribe tu pregunta.'); abrirEscribir(); }
$('mic').onclick = () => {
  cerrarPanel();
  if(rec){ try{ rec.stop(); }catch(e){} return; }
  if(!SR) return sinMicro();
  try{
    callar();
    rec = new SR(); rec.lang = 'es-ES'; rec.interimResults = false;
    rec.onstart = () => { $('mic').classList.add('rec'); $('pista').textContent = 'Te escucho…'; };
    rec.onend = () => { $('mic').classList.remove('rec'); rec = null; estado(); };
    rec.onerror = ev => { if(['not-allowed','service-not-allowed','audio-capture','network'].includes(ev.error)) sinMicro(); else toast('No te he oído bien. Prueba otra vez o escribe la pregunta.'); };
    rec.onresult = ev => { const q = (ev.results[0][0].transcript || '').trim(); if(q) preguntar(q); };
    rec.start();
  }catch(e){ rec = null; sinMicro(); }
};
function cerrarPanel(){ $('panel').hidden = true; $('alt').setAttribute('aria-expanded', 'false'); }
function panelUI(){ $('pVoz').setAttribute('aria-pressed', G.voz); $('pTxt').setAttribute('aria-pressed', G.texto); $('app').classList.toggle('sintexto', !G.texto); }
$('alt').onclick = () => { const abrir = $('panel').hidden; $('panel').hidden = !abrir; $('alt').setAttribute('aria-expanded', String(abrir)); };
$('pVoz').onclick = () => { G.voz = !G.voz; if(!G.voz) try{ speechSynthesis.cancel(); }catch(e){} panelUI(); toast(G.voz ? 'Voz activada' : 'Voz desactivada: el texto sigue a ritmo de lectura'); };
$('pTxt').onclick = () => { if(G.texto && !G.voz){ toast('Activa la voz antes de quitar el texto'); return; } G.texto = !G.texto; panelUI(); };
document.addEventListener('click', e => { if(!$('panel').hidden && !e.target.closest('#panel,#alt')) cerrarPanel(); });

/* ======================= Hojas y lo demás ======================= */
document.querySelectorAll('.sheet').forEach(s => s.addEventListener('click', e => { if(e.target === s || e.target.closest('[data-close]')) s.hidden = true; }));
$('menuB').onclick = () => { $('ajS').hidden = false; };
$('fichaB').onclick = () => { $('ajS').hidden = true; $('fichaS').hidden = false; };
const INST = {modo:'hablar'};
function pintarInst(){
  const k = U.obra || 'dormitorio';
  $('instObra').textContent = OBRAS[k].titulo;
  document.querySelectorAll('#fInst [data-v]').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === INST.modo));
  $('instT').textContent = instrucciones(INST.modo, k);
}
$('instB').onclick = () => { $('ajS').hidden = true; INST.modo = U.obra ? 'obra' : 'hablar'; pintarInst(); $('instS').hidden = false; };
$('fInst').addEventListener('click', e => { const b = e.target.closest('[data-v]'); if(b){ INST.modo = b.dataset.v; pintarInst(); } });
$('deNuevoB').onclick = () => {
  $('ajS').hidden = true; cerrarObra();
  U.asked.clear(); U.vistas.clear(); U.obra = null; U.empezada = false; M.saludado = false; M.filtro = 'empezar'; M.epoca = -1;
  $('lineas').innerHTML = ''; $('app').classList.remove('escribiendo'); $('askF').hidden = true; selloA(null);
  irA('inicio'); $('iniS').innerHTML = imanSVG(); $('iniP').textContent = PERSONAJE.pregunta;
};
let rz = 0;
addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => {
  if(O.k) camara(O.partes[O.i] && O.playing ? O.partes[O.i].z : null, false);
  if(U.vista === 'obras'){ const m = $('mapa'), f = m.scrollLeft/(m.scrollWidth || 1); pintarMapa(); m.scrollLeft = f*m.scrollWidth; }
  if(U.obra && !U.hablando) selloA(U.obra);
}, 120); });
document.addEventListener('keydown', e => { if(e.key === 'Escape'){ document.querySelectorAll('.sheet').forEach(s => s.hidden = true); if(O.k) cerrarObra(); } });
aplicarDiseno();
