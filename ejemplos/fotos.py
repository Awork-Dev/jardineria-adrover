# Crea los ejemplos con fotos (parte de hoy, gastos con ticket y fotos de un trabajo) a través de la API de la
# app del equipo, como lo haría un operario. Necesita que antes se haya cargado ejemplos/semilla.py.
# Uso: python3 ejemplos/fotos.py https://equipo.jardineriaadrover.workers.dev
import json, sys, os, urllib.request, datetime, zoneinfo
DIR = os.path.join(os.path.dirname(__file__), 'imagenes')
BASE = sys.argv[1]
hoy = datetime.datetime.now(zoneinfo.ZoneInfo('Europe/Madrid')).date()
def pedir(ruta, cuerpo=None, token=None, tipo='application/json'):
    datos = cuerpo if isinstance(cuerpo, bytes) else (json.dumps(cuerpo).encode() if cuerpo is not None else None)
    r = urllib.request.Request(BASE + ruta, data=datos, method='POST' if datos is not None else 'GET', headers={'content-type': tipo, **({'authorization': 'Bearer ' + token} if token else {})})
    with urllib.request.urlopen(r) as x: return json.loads(x.read() or b'{}')
def entrar(pin): return pedir('/api/entrar', {'pin': pin})['token']
def foto(token, nombre, id):
    pedir('/api/fotos?id=' + id, open(os.path.join(DIR, nombre), 'rb').read(), token, 'image/jpeg')
    pedir('/api/fotos?id=' + id + '&mini=1', open(os.path.join(DIR, 'mini-' + nombre), 'rb').read(), token, 'image/jpeg')
    return id
jefe, maria, pep = entrar('1001'), entrar('1002'), entrar('1003')
f1, f2 = foto(jefe, 'poda.jpg', 'ejfotopoda'), foto(jefe, 'mant.jpg', 'ejfotomant')
pedir('/api/partes', {'id': 'tejpartehoy', 'fecha': hoy.isoformat(), 'clienteId': 'cejhotel', 'inicio': '08:00', 'fin': '10:30',
      'operarios': ['oejjefe', 'oejpep'], 'tareas': ['Poda', 'Tratamiento', 'Retirada de restos'],
      'descripcion': 'Poda de las palmeras de la terraza y tratamiento preventivo.', 'incidencias': 'El cliente pregunta por presupuesto para renovar el césped de la piscina.', 'fotos': [f1, f2]}, jefe)
t1 = foto(maria, 'ticket-gasolina.jpg', 'ejticketgas')
pedir('/api/gastos', {'id': 'gejgasolina', 'fecha': hoy.isoformat(), 'tipo': 'Gasolina', 'importe': 52.40, 'nota': 'Furgoneta grande', 'fotos': [t1]}, maria)
f3 = foto(maria, 'flor.jpg', 'ejfotoflor')
pedir('/api/fotos-trabajo', {'id': 'fejcomun', 'fecha': (hoy - datetime.timedelta(days=2)).isoformat(), 'clienteId': 'cejcomun', 'nota': 'Así quedaron los parterres de la entrada.', 'fotos': [f3]}, maria)
t2 = foto(pep, 'ticket-material.jpg', 'ejticketmat')
pedir('/api/gastos', {'id': 'gejmaterial', 'fecha': (hoy - datetime.timedelta(days=1)).isoformat(), 'tipo': 'Material', 'importe': 18.90, 'nota': 'Gomas de riego y tijera (Joan Ferrer)', 'fotos': [t2]}, pep)
for t in (jefe, maria, pep): pedir('/api/salir', {}, t)
print('Ejemplos con fotos creados en', BASE)
