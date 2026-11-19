CREATE TABLE IF NOT EXISTS docs (coleccion TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL, actualizado TEXT NOT NULL, PRIMARY KEY (coleccion, id));
CREATE TABLE IF NOT EXISTS intentos (ip TEXT PRIMARY KEY, fallos INTEGER NOT NULL, desde INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS sesiones (token TEXT PRIMARY KEY, operarioId TEXT NOT NULL, pin TEXT NOT NULL, creado INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS fotos_subidas (id TEXT PRIMARY KEY, operarioId TEXT NOT NULL, creado INTEGER NOT NULL);
-- Índices para que cada consulta lea solo lo necesario (límite gratuito de lecturas de D1).
CREATE INDEX IF NOT EXISTS docs_actualizado ON docs (actualizado);
CREATE INDEX IF NOT EXISTS docs_operario ON docs (coleccion, json_extract(data, '$.operarioId'));
CREATE INDEX IF NOT EXISTS docs_autor ON docs (coleccion, json_extract(data, '$.autorId'));
-- Borrados recientes, para que la gestión los quite de pantalla al sincronizar solo los cambios.
CREATE TABLE IF NOT EXISTS borrados (coleccion TEXT NOT NULL, id TEXT NOT NULL, cuando TEXT NOT NULL, PRIMARY KEY (coleccion, id));
CREATE INDEX IF NOT EXISTS borrados_cuando ON borrados (cuando);
-- Conexión con Google (gestion/src/google.js): ajustes y llave cifrada, lo ya enviado y lo pendiente de enviar.
-- No son documentos: no van en las copias de seguridad.
CREATE TABLE IF NOT EXISTS google (clave TEXT PRIMARY KEY, valor TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS google_sinc (tipo TEXT NOT NULL, id TEXT NOT NULL, gid TEXT NOT NULL, huella TEXT NOT NULL, etag TEXT, PRIMARY KEY (tipo, id));
CREATE TABLE IF NOT EXISTS google_cola (tipo TEXT NOT NULL, id TEXT NOT NULL, intentos INTEGER NOT NULL DEFAULT 0, error TEXT, PRIMARY KEY (tipo, id));
-- Para rehacer las citas de un cliente cuando cambia su nombre o su dirección.
CREATE INDEX IF NOT EXISTS docs_cliente ON docs (coleccion, json_extract(data, '$.clienteId'));
-- Documentos del personal (compartido/archivos.js): el archivo troceado en base64; sus datos, en la colección «documentos».
-- Los Workers la crean solos si no existe.
CREATE TABLE IF NOT EXISTS archivos (id TEXT NOT NULL, parte INTEGER NOT NULL, datos TEXT NOT NULL, PRIMARY KEY (id, parte));
