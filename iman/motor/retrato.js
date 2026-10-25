/* ======================= El kit del personaje: su paleta, su retrato y su fondo ======================= */
const ARTE = (() => { const A = PERSONAJE.arte || {}; return {patron:RUTA_P(A.patron), avatar:RUTA_P(A.avatar), linea:RUTA_P(A.linea), completo:RUTA_P(A.completo)}; })();
// Las imágenes de fondo van en variables CSS: con la URL entera, para que no dependan de dónde esté la hoja de estilos
// La paleta de «Su color» y el encuadre de la línea de fondo salen de la ficha de cada personaje
(() => {
  const p = PERSONAJE.paleta || {}, e = (PERSONAJE.arte || {}).lineaEncuadre || {};
  let css = ':root[data-tema=personaje]{';
  if(p.bg) css += `--bg:${p.bg};`;
  if(p.fg) css += `--fg:${p.fg};`;
  if(p.trazo) css += `--trazo:${p.trazo};`;
  if(p.vidrio) css += `--vidrio:${p.vidrio};`;
  if(p.pColor) css += `--p-color:${p.pColor};`;
  css += '}';
  // Interfaz nueva: el tema oscuro sale del mismo color que «Su color» (esquema oscuro de Material 3), no de un negro genérico
  const o = p.oscuro;
  if(o) css += `:root[data-interfaz=nueva]:not([data-tema]){--bg:${o.bg};--fg:${o.fg};--muted:${o.muted};--hair:${o.hair};--panel:${o.panel};--tinta:${o.bg};`
    + `--acento:${o.acento};--sobre-acento:${o.sobreAcento};--trazo:${o.acento};--p-color:${o.pColor};--tonal:${o.tonal};--sobre-tonal:${o.sobreTonal}}`;
  css += `.fondoL{aspect-ratio:${e.ratio || '1/1'}}`;
  css += `:root[data-tema=personaje] .fondoL{width:${e.ancho || 'min(230vw,1000px)'};top:${e.arriba || '84px'};transform:translateX(${e.x || '-47%'});opacity:${e.opacidad || '.72'}}`;
  document.head.insertAdjacentHTML('beforeend', `<style id="paleta">${css}</style>`);
})();
// El imán: con la ilustración compuesta, una sola imagen; si no, el patrón detrás y el retrato recortado encima
function imanSVG(cerca){
  const cl = `iman${cerca ? ' cerca' : ''}`, al = `El imán: retrato ilustrado de ${PERSONAJE.nombre}`;
  if(ARTE.completo) return `<span class="${cl}" role="img" aria-label="${al}"><img class="iman-c" src="${ARTE.completo}" alt=""></span>`;
  return `<span class="${cl}" role="img" aria-label="${al}">${ARTE.patron ? '<span class="iman-p"></span>' : ''}${ARTE.avatar ? `<img class="iman-a" src="${ARTE.avatar}" alt="">` : ''}</span>`;
}
if(ARTE.patron){ document.getElementById('capaP').innerHTML = '<span class="fondoP"></span>'; document.documentElement.style.setProperty('--arte-patron', `url(${new URL(ARTE.patron, document.baseURI).href})`); }
if(ARTE.linea){ document.getElementById('capaR').innerHTML = '<span class="fondoL"></span>'; document.documentElement.style.setProperty('--arte-linea', `url(${new URL(ARTE.linea, document.baseURI).href})`); }
