# Datos de ejemplo para enseñar la gestión y la app del equipo. Las fechas son relativas al día en que se
# cargan. Todo va marcado «(Ejemplo)» y la gestión los borra de una vez con «Borrar ejemplos».
# Uso: python3 ejemplos/semilla.py > ejemplos.sql (lo hace la tarea «Cargar ejemplos»).
import json, datetime, zoneinfo, sys
Z = zoneinfo.ZoneInfo('Europe/Madrid')
ahora = datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z')
hoy = datetime.datetime.now(Z).date()
docs = []
def doc(col, id, d): d['ejemplo'] = True; docs.append((col, id, d))
# Clientes y proveedores
cli = {
 'cejhotel': dict(nombre='Hotel Sa Marina (Ejemplo)', cif='B57000001', contacto='Marta, jefa de mantenimiento', email='mantenimiento@ejemplo.com', telefono='971 000 001', direccion='Carrer de la Mar, 5', cp='07590', poblacion='Cala Ratjada', provincia='Illes Balears', notas='Visitas los martes. Llaves en recepción.'),
 'cejcomun': dict(nombre='Comunidad Es Pinaret (Ejemplo)', cif='H07000002', contacto='Pere, presidente', email='espinaret@ejemplo.com', telefono='600 000 002', direccion='Avinguda de Son Moll, 20', cp='07580', poblacion='Capdepera', provincia='Illes Balears', notas=''),
 'cejjoan': dict(nombre='Joan Ferrer (Ejemplo)', cif='43000003X', contacto='', email='joan@ejemplo.com', telefono='600 000 003', direccion='Camí de Ses Rotes, 8', cp='07580', poblacion='Capdepera', provincia='Illes Balears', notas='Tiene perro, avisar antes de entrar.'),
}
for k, v in cli.items(): doc('clientes', k, v)
doc('proveedores', 'vejviveros', dict(nombre='Viveros Llevant (Ejemplo)', cif='B07000010', contacto='Toni', email='pedidos@ejemplo.com', telefono='971 000 010', direccion='Carretera de Manacor, km 3', cp='07500', poblacion='Manacor', provincia='Illes Balears', categoria='Plantas y árboles', notas=''))
doc('proveedores', 'vejriegos', dict(nombre='Riegos Manacor (Ejemplo)', cif='B07000011', contacto='', email='riegos@ejemplo.com', telefono='971 000 011', direccion='Polígon de Manacor, nau 4', cp='07500', poblacion='Manacor', provincia='Illes Balears', categoria='Material de riego', notas=''))
snap = lambda k: {x: cli[k].get(x, '') for x in ['nombre','cif','direccion','cp','poblacion','provincia','telefono','email','contacto']}
d = lambda n: (hoy - datetime.timedelta(days=n)).isoformat()
# Presupuestos y nota (numeración EJ: no cuenta para los números reales)
lin1 = [dict(concepto='Mantenimiento mensual de jardines (4 visitas)', cantidad=4, precio=180), dict(concepto='Poda de palmeras datileras', cantidad=6, precio=65), dict(concepto='Tratamiento preventivo contra el picudo rojo', cantidad=6, precio=35)]
doc('presupuestos', 'pejhotel', dict(numero='P-2026-EJ1', clienteId='cejhotel', cliente=snap('cejhotel'), fecha=d(20), estado='aceptado', iva=21, lineas=lin1, notas='Precio válido hasta final de año.'))
lin2 = [dict(concepto='Material de riego por goteo (tuberías, goteros y programador)', cantidad=1, precio=640), dict(concepto='Mano de obra de instalación', cantidad=12, precio=32)]
doc('presupuestos', 'pejcomun', dict(numero='P-2026-EJ2', clienteId='cejcomun', cliente=snap('cejcomun'), fecha=d(4), estado='enviado', iva=21, lineas=lin2, notas='Incluye retirada del riego antiguo.'))
doc('presupuestos', 'pejjoan', dict(numero='P-2026-EJ3', clienteId='cejjoan', cliente=snap('cejjoan'), fecha=d(1), estado='borrador', iva=10, lineas=[dict(concepto='Plantación de seto de pitosporo (20 m)', cantidad=20, precio=28)], notas=''))
doc('notas', 'nejhotel', dict(numero='N-2026-EJ1', clienteId='cejhotel', cliente=snap('cejhotel'), fecha=d(2), estado='pendiente', iva=21, origen='P-2026-EJ1', lineas=[dict(concepto='Mantenimiento de jardines de octubre (4 visitas)', cantidad=4, precio=180), dict(concepto='Poda de palmeras datileras', cantidad=6, precio=65)], notas='Trabajo de octubre.'))
doc('notas', 'nejjoan', dict(numero='N-2026-EJ2', clienteId='cejjoan', cliente=snap('cejjoan'), fecha=d(15), estado='cobrada', iva=21, lineas=[dict(concepto='Desbroce de parcela', cantidad=1, precio=220)], notas=''))
# Operarios de ejemplo (PIN de prueba)
ops = {'oejjefe': ('Toni Jefe (Ejemplo)', 'jefe', '1001'), 'oejmaria': ('María Operaria (Ejemplo)', 'operario', '1002'), 'oejpep': ('Pep Operario (Ejemplo)', 'operario', '1003')}
for k, (n, r, p) in ops.items(): doc('operarios', k, dict(nombre=n, rol=r, activo=True, pin=p))
# Fichajes de los últimos días laborables (hora de Mallorca)
def ts(dia, h, m): return int(datetime.datetime.combine(dia, datetime.time(h, m), Z).timestamp() * 1000)
n = 0
for atras in range(1, 9):
  dia = hoy - datetime.timedelta(days=atras)
  if dia.weekday() >= 5: continue
  for i, (k, (nombre, r, p)) in enumerate(ops.items()):
    e = ts(dia, 7, 30 + i * 2); s = ts(dia, 15, (atras * 7 + i * 11) % 20)
    for tipo, t in (('entrada', e), ('salida', s)):
      n += 1; doc('fichajes', f'fejemplo{n}', dict(operarioId=k, operario=nombre, tipo=tipo, ts=t, recibido=t, sinConexion=False))
# Partes de días anteriores (el de hoy, con foto, se hace desde la app)
partes = [(3, 'cejhotel', '08:00', '12:30', ['oejjefe', 'oejmaria'], ['Corte de césped', 'Poda', 'Retirada de restos'], 'Césped de la piscina y setos de la entrada.', 'Una palmera de la terraza tiene hojas centrales caídas: posible picudo.'),
          (2, 'cejcomun', '08:00', '14:00', ['oejjefe', 'oejmaria', 'oejpep'], ['Riego', 'Limpieza'], 'Revisión del riego de las zonas comunes.', 'Programador del sector 3 estropeado. Hace falta presupuesto.'),
          (1, 'cejjoan', '09:00', '11:00', ['oejjefe', 'oejpep'], ['Desbroce', 'Retirada de restos'], 'Desbroce de la parte de atrás.', '')]
for i, (atras, c, ini, fin, quien, tareas, desc, inc) in enumerate(partes):
  dur = (int(fin[:2]) * 60 + int(fin[3:]) - int(ini[:2]) * 60 - int(ini[3:])) / 60
  doc('partes', f'tejparte{i}', dict(fecha=d(atras), clienteId=c, inicio=ini, fin=fin, operarios=quien, operario=', '.join(ops[q][0] for q in quien), duracion=dur, horas=dur * len(quien), tareas=tareas, descripcion=desc, incidencias=inc, autorId='oejjefe', autor=ops['oejjefe'][0], origen='equipo', creado=ts(hoy - datetime.timedelta(days=atras), 13, 0), fotos=[]))
sql = ';\n'.join("INSERT OR REPLACE INTO docs (coleccion, id, data, actualizado) VALUES ('%s', '%s', '%s', '%s')" % (c, i, json.dumps(v, ensure_ascii=False, separators=(",", ":")).replace("'", "''"), ahora) for c, i, v in docs)
assert ';' not in ''.join(json.dumps(v, ensure_ascii=False) for _, _, v in docs)
sys.stdout.write(sql + ';\n')
print(len(docs), 'documentos de ejemplo', file=sys.stderr)
