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
