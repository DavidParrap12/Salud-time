/**
 * Prueba real del proxy del frontend, API, backend y PostgreSQL.
 * Crea registros en una base cuyo nombre termine en _test; no borra datos.
 * API_URL debe apuntar al servidor del frontend (por ejemplo, http://localhost:4000).
 */
const assert = require('node:assert/strict');
const { sequelize, Usuario, Medicamento, Tratamiento, Recordatorio, DosisProgramada, RegistroDosis } = require('../src/models');

if (!process.env.DB_NAME?.endsWith('_test')) {
  console.error('La prueba solo se ejecuta con DB_NAME terminado en _test.');
  process.exit(1);
}

const base = process.env.API_URL || 'http://localhost:4000';
const fechaLocal = (valor = new Date()) =>
  `${valor.getFullYear()}-${String(valor.getMonth() + 1).padStart(2, '0')}-${String(valor.getDate()).padStart(2, '0')}`;

async function pedir(ruta, { method = 'GET', body, token } = {}) {
  const respuesta = await fetch(base + ruta, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  return { status: respuesta.status, payload: await respuesta.json() };
}

async function main() {
  await sequelize.authenticate();
  const sufijo = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
  const credenciales = { correo: `flujo${sufijo}@example.com`, contrasena: 'ClavePrueba123' };
  const registro = await pedir('/api/auth/registro/paciente', {
    method: 'POST',
    body: { nombre_completo: 'Paciente de prueba', edad: 30, ...credenciales }
  });
  assert.equal(registro.status, 201, JSON.stringify(registro.payload));
  const idPaciente = registro.payload.data.id_usuario;
  assert.ok(await Usuario.findByPk(idPaciente), 'El usuario debe persistir en PostgreSQL');

  const login = await pedir('/api/auth/login', { method: 'POST', body: credenciales });
  assert.equal(login.status, 200, JSON.stringify(login.payload));
  const token = login.payload.data.token;

  const medicamento = await pedir('/api/medicamentos', {
    method: 'POST', token, body: { nombre: `Medicamento flujo ${sufijo}`, presentacion: 'Tableta' }
  });
  assert.equal(medicamento.status, 201, JSON.stringify(medicamento.payload));
  const idMedicamento = medicamento.payload.data.id_medicamento;
  assert.ok(await Medicamento.findByPk(idMedicamento), 'El medicamento debe persistir');

  const tratamiento = await pedir('/api/tratamientos', {
    method: 'POST', token,
    body: { id_paciente: idPaciente, id_medicamento: idMedicamento, dosis: 'Una tableta', fecha_inicio: fechaLocal() }
  });
  assert.equal(tratamiento.status, 201, JSON.stringify(tratamiento.payload));
  const idTratamiento = tratamiento.payload.data.id_tratamiento;
  assert.ok(await Tratamiento.findByPk(idTratamiento), 'El tratamiento debe persistir');

  const recordatorio = await pedir('/api/recordatorios', {
    method: 'POST', token,
    body: {
      id_tratamiento: idTratamiento, hora: '23:30',
      dias_semana: 'LUN,MAR,MIE,JUE,VIE,SAB,DOM', fecha_inicio: fechaLocal()
    }
  });
  assert.equal(recordatorio.status, 201, JSON.stringify(recordatorio.payload));
  const idRecordatorio = recordatorio.payload.data.id_recordatorio;
  assert.ok(await Recordatorio.findByPk(idRecordatorio), 'El recordatorio debe persistir');

  const dosis = await DosisProgramada.findOne({ where: { id_recordatorio: idRecordatorio } });
  assert.ok(dosis, 'El recordatorio debe crear dosis en PostgreSQL');
  const totalAntes = await DosisProgramada.count({ where: { id_recordatorio: idRecordatorio } });
  const dashboard = await pedir(`/api/dashboard/${idPaciente}`, { token });
  assert.equal(dashboard.status, 200, JSON.stringify(dashboard.payload));
  const calendario = await pedir(`/api/calendario/${idPaciente}/fecha?fecha=${fechaLocal()}`, { token });
  assert.equal(calendario.status, 200, JSON.stringify(calendario.payload));
  assert.ok(calendario.payload.data.some((item) => item.id_dosis_programada === dosis.id_dosis_programada));
  await pedir(`/api/calendario/${idPaciente}/fecha?fecha=${fechaLocal()}`, { token });
  assert.equal(await DosisProgramada.count({ where: { id_recordatorio: idRecordatorio } }), totalAntes,
    'Releer el calendario no debe duplicar dosis');

  const otroCorreo = `otro${sufijo}@example.com`;
  const otroRegistro = await pedir('/api/auth/registro/paciente', {
    method: 'POST', body: { nombre_completo: 'Segundo paciente', correo: otroCorreo, contrasena: 'ClavePrueba123', edad: 31 }
  });
  assert.equal(otroRegistro.status, 201, JSON.stringify(otroRegistro.payload));
  const otroLogin = await pedir('/api/auth/login', {
    method: 'POST', body: { correo: otroCorreo, contrasena: 'ClavePrueba123' }
  });
  const otroToken = otroLogin.payload.data.token;
  const otro = await pedir(`/api/dashboard/${idPaciente}`, { token: otroToken });
  assert.equal(otro.status, 403, 'No debe leer el dashboard de otro paciente');
  const confirmarAjena = await pedir(`/api/dosis/${dosis.id_dosis_programada}/confirmar`, {
    method: 'POST', token: otroToken, body: {}
  });
  assert.equal(confirmarAjena.status, 403, 'No debe confirmar la dosis de otro paciente');
  const rol = await pedir(`/api/roles/asignar/${idPaciente}`, { method: 'POST', token, body: { id_rol: 2 } });
  assert.equal(rol.status, 403, 'Un paciente no debe asignarse roles');

  const confirmar = await pedir(`/api/dosis/${dosis.id_dosis_programada}/confirmar`, {
    method: 'POST', token, body: {}
  });
  assert.equal(confirmar.status, 201, JSON.stringify(confirmar.payload));
  await dosis.reload();
  assert.equal(dosis.estado, 'TOMADA', 'La confirmación debe persistir');
  assert.ok(await RegistroDosis.findOne({ where: { id_dosis_programada: dosis.id_dosis_programada } }));

  const cambioHora = await pedir(`/api/recordatorios/${idRecordatorio}/hora`, {
    method: 'PATCH', token, body: { hora: '22:00' }
  });
  assert.equal(cambioHora.status, 200, JSON.stringify(cambioHora.payload));
  const dosisActualizadas = await DosisProgramada.findAll({ where: { id_recordatorio: idRecordatorio } });
  assert.ok(dosisActualizadas.some((item) => item.estado === 'PENDIENTE'), 'Debe haber dosis futuras');
  assert.ok(dosisActualizadas.filter((item) => item.estado === 'PENDIENTE')
    .every((item) => item.fecha_hora.getHours() === 22), 'El cambio de hora debe persistir en las dosis pendientes');
  assert.equal((await DosisProgramada.findByPk(dosis.id_dosis_programada)).estado, 'TOMADA',
    'Actualizar el horario debe conservar el historial de dosis tomadas');

  console.log('OK: frontend proxy → API → PostgreSQL → lectura posterior.');
  console.log(`IDs persistidos: usuario=${idPaciente}, medicamento=${idMedicamento}, tratamiento=${idTratamiento}, recordatorio=${idRecordatorio}, dosis=${dosis.id_dosis_programada}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => sequelize.close());
