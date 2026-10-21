/* ======================= Los datos: exposición y personaje activo, leídos de window.DATOS ======================= */
/* window.DATOS = {modo, raiz, iman, exposicion, activo, personajes:{id:{ficha, obras}}}
   raiz: delante de las rutas del repositorio (img/, unidad/) · iman: delante de las del imán (personajes/…) */
const DATOS = window.DATOS;
const EXPO = DATOS.exposicion || null;
const PID = DATOS.activo;
const PD = DATOS.personajes[PID];
const externa = p => /^(data:|blob:|https?:)/.test(p);
const RUTA = p => p && !externa(p) ? DATOS.raiz + p : p;
const RUTA_P = p => p && !externa(p) ? DATOS.iman + 'personajes/' + PID + '/' + p : p;
const RUTA_I = p => p && !externa(p) ? DATOS.iman + p : p;
const PERSONAJE = PD.ficha;
const CITAS = PERSONAJE.citas || {};
const QA = PERSONAJE.qa || [];
const QI = Object.fromEntries(QA.map(x => [x.id, x]));
/* Sus obras: las propias (preparadas a fondo) y las del catálogo, todas juntas, por fecha */
const OBRAS = {};
Object.entries(PD.obras.propias || {}).forEach(([k, o]) => { OBRAS[k] = Object.assign(o, {k, propia:true, img:RUTA(o.img), th:RUTA(o.th || o.img)}); });
(PD.obras.catalogo || []).forEach(o => { OBRAS[o.k] = Object.assign(o, {img:RUTA(o.img), th:RUTA(o.th || o.img)}); });
const ORDEN = Object.values(OBRAS).sort((a, b) => a.año - b.año);
const EPOCAS = PD.obras.epocas || [];
const SELECCIONES = (PD.obras.selecciones || []).filter(s => s.obras && s.obras.some(k => OBRAS[k]));
const epocaDe = o => EPOCAS.findIndex(e => o.año <= e.hasta);
const tieneVisita = o => !!(o.visitaQA || (o.visita && o.visita.length));
/* Para empezar: pocas obras, las que más invitan a mirar, cada una con una frase suya */
const EMPEZAR = (PD.obras.empezar || []).filter(e => OBRAS[e.k]);
/* Los demás personajes de la exposición */
const OTROS = EXPO ? EXPO.personajes.filter(p => p.id !== PID) : [];
document.title = document.title || ('Imán de ' + PERSONAJE.corto);
