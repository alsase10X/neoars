// Monta cada prompt con los archivos de la pieza.
// La plantilla (versiones/<nombre>.md) va como mensaje de sistema;
// lo que dice el visitante (vars.visitante) va como mensaje de usuario.

const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');

function leer(rel) {
  const ruta = path.join(raiz, rel);
  return fs.existsSync(ruta) ? fs.readFileSync(ruta, 'utf8').trim() : '';
}

function construir(nombre) {
  return function ({ vars }) {
    const pieza = `piezas/${vars.pieza}`;
    const datos = {
      identidad: leer(`${pieza}/identidad.md`),
      representa: leer(`${pieza}/representa.md`),
      memoria: leer(`${pieza}/memoria.md`),
    };
    const sistema = leer(`versiones/${nombre}.md`)
      .replace(/\{\{(\w+)\}\}/g, (_, clave) => datos[clave] ?? '')
      .replace(/[ \t]+$/gm, '');
    return [
      { role: 'system', content: sistema },
      { role: 'user', content: vars.visitante },
    ];
  };
}

module.exports = {
  personaje: construir('personaje'),
  hibrido: construir('hibrido'),
  mediador: construir('mediador'),
  reglamento: construir('reglamento'),
};
