// Listas que comparten la gestión y la app del equipo: si se cambian aquí, cambian en las dos.
export const TAREAS = ['Corte de césped', 'Poda', 'Desbroce', 'Riego', 'Plantación', 'Limpieza', 'Retirada de restos', 'Tratamiento'];
export const TIPOS_GASTO = ['Gasolina', 'Material', 'Comida', 'Peaje o parking', 'Otros'];
// PIN incorrectos en la app del equipo, contando todas las conexiones juntas: al llegar al tope en un día, nadie
// puede entrar con PIN hasta que pase (quien ya tiene la app abierta sigue trabajando) y la gestión lo avisa.
// Sin esto, probando desde muchas conexiones a la vez se podrían recorrer los 10.000 PIN posibles.
export const PIN_TODAS = {clave: 'equipo:*', max: 60, ventana: 24 * 3600e3};
// Para la página de la gestión, que es HTML estático: se inyecta como <script>.
export const constantesJS = () => `const TAREAS = ${JSON.stringify(TAREAS)}, TIPOS_GASTO = ${JSON.stringify(TIPOS_GASTO)};`;
