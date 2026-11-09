-- Estadísticas anónimas de la web (base «jardineria-adrover-web»): visitas por día, página, idioma y país,
-- y plantas que se buscan y no están en la guía. No se guarda la dirección IP ni nada que identifique a nadie.
-- Las escribe la web (web/src/visitas.js) y las lee la gestión (Resumen → «La web»).
CREATE TABLE IF NOT EXISTS visitas (
  dia TEXT NOT NULL, ruta TEXT NOT NULL, idioma TEXT NOT NULL, pais TEXT NOT NULL, n INTEGER NOT NULL,
  PRIMARY KEY (dia, ruta, idioma, pais)
) WITHOUT ROWID;
CREATE TABLE IF NOT EXISTS busquedas (
  q TEXT PRIMARY KEY, idioma TEXT NOT NULL, n INTEGER NOT NULL, ultima TEXT NOT NULL
) WITHOUT ROWID;
-- Tope diario de apuntes (clave: día y qué se cuenta), para que un robot no gaste el cupo de escrituras de la cuenta.
CREATE TABLE IF NOT EXISTS topes (clave TEXT PRIMARY KEY, n INTEGER NOT NULL) WITHOUT ROWID;
