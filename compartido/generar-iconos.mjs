// Crea compartido/iconos-<app>.js (iconos en base64) a partir de compartido/iconos/<app>/.
// Cada app importa solo los suyos, para no cargar los de las demás.
// Uso: node compartido/generar-iconos.mjs (después de cambiar algún icono).
import fs from 'fs';
const dir = new URL('./iconos/', import.meta.url);
const tipos = { png: 'image/png', ico: 'image/x-icon' };
const apps = fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort();
for (const app of apps) {
  const sub = new URL(app + '/', dir);
  const filas = fs.readdirSync(sub).filter(f => tipos[f.split('.').pop()]).sort().map(f =>
    `  "/${f}": ["${tipos[f.split('.').pop()]}", "${fs.readFileSync(new URL(f, sub)).toString('base64')}"],`);
  fs.writeFileSync(new URL(`./iconos-${app}.js`, import.meta.url),
    '// Generado por compartido/generar-iconos.mjs: no editar a mano.\nexport const ICONOS = {\n' + filas.join('\n') + '\n};\n');
}
