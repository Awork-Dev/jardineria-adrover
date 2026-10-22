// Vuelve a crear compartido/iconos-datos.js a partir de los archivos de compartido/iconos/.
// Uso: node compartido/generar-iconos.mjs (después de cambiar algún icono).
import fs from 'fs';
const dir = new URL('./iconos/', import.meta.url);
const tipos = { png: 'image/png', ico: 'image/x-icon' };
const filas = fs.readdirSync(dir).filter(f => tipos[f.split('.').pop()]).sort().map(f =>
  `  "/${f}": ["${tipos[f.split('.').pop()]}", "${fs.readFileSync(new URL(f, dir)).toString('base64')}"],`);
fs.writeFileSync(new URL('./iconos-datos.js', import.meta.url),
  '// Generado por compartido/generar-iconos.mjs: no editar a mano.\nexport const ICONOS = {\n' + filas.join('\n') + '\n};\n');
