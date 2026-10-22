// Listas que comparten la gestión y la app del equipo: si se cambian aquí, cambian en las dos.
export const TAREAS = ['Corte de césped', 'Poda', 'Desbroce', 'Riego', 'Plantación', 'Limpieza', 'Retirada de restos', 'Tratamiento'];
export const TIPOS_GASTO = ['Gasolina', 'Material', 'Comida', 'Peaje o parking', 'Otros'];
// Para la página de la gestión, que es HTML estático: se inyecta como <script>.
export const constantesJS = () => `const TAREAS = ${JSON.stringify(TAREAS)}, TIPOS_GASTO = ${JSON.stringify(TIPOS_GASTO)};`;
