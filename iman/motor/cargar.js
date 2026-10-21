/* ======================= Cargador (versión del repositorio) =======================
   ?p=<personaje>&e=<exposición> · lee exposiciones/<e>.json y personajes/<p>/{ficha,obras}.json
   y después carga el motor. La versión para Claude lleva todo esto incrustado (scripts/montar.py). */
(async () => {
  const q = new URLSearchParams(location.search), hash = location.hash.slice(1).split('.')[0];
  const eid = q.get('e') || 'vincent-y-monet';
  const json = u => fetch(u, {cache:'no-cache'}).then(r => { if(!r.ok) throw new Error(u + ' · ' + r.status); return r.json(); });
  let expo = null; try{ expo = await json(`exposiciones/${eid}.json`); }catch(e){}
  const pid = q.get('p') || hash || (expo && expo.personajes[0].id) || 'van-gogh';
  try{
    const [ficha, obras] = await Promise.all([json(`personajes/${pid}/ficha.json`), json(`personajes/${pid}/obras.json`)]);
    window.DATOS = {modo:'repo', raiz:'../', iman:'', exposicion:expo, activo:pid, personajes:{[pid]:{ficha, obras}}};
  }catch(e){ document.body.insertAdjacentHTML('beforeend', `<p style="padding:24px;font:16px sans-serif">No encuentro el personaje «${pid}».</p>`); return; }
  for(const s of ['motor/datos.js', 'motor/retrato.js', 'motor/logica.js', 'motor/prompt.js'])
    await new Promise((ok, ko) => { const el = document.createElement('script'); el.src = s; el.onload = ok; el.onerror = ko; document.body.appendChild(el); });
})();
