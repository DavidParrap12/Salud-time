/**
 * Crea las tablas y carga datos de demostración.
 * Uso: npm run seed
 *
 * ADVERTENCIA: elimina y vuelve a crear todas las tablas de la base de datos
 * configurada en .env (DB_NAME).
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const bcrypt = require('bcryptjs');
const {
  sequelize,
  Usuario,
  Rol,
  UsuarioRol,
  Especializacion,
  MedicoEspecializacion,
  Medicamento,
  Tratamiento,
  CuidadorPaciente,
  Recordatorio,
  DosisProgramada,
  RegistroDosis,
  Notificacion
} = require('./src/models');

const PASSWORD = 'Salud1234';
const hoy = new Date();
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dia = (offset) => new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + offset);
const hora = (offset, h, m = 0) =>
  new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + offset, h, m, 0);

async function main() {
  console.log('Sincronizando tablas (force: true)...');
  await sequelize.sync({ force: true });

  const hash = await bcrypt.hash(PASSWORD, 10);

  const roles = {};
  for (const [nombre, descripcion] of [
    ['PACIENTE', 'Usuario que recibe el tratamiento'],
    ['MEDICO', 'Profesional que prescribe tratamientos'],
    ['CUIDADOR', 'Persona a cargo de un paciente'],
    ['ADMIN', 'Administrador del sistema']
  ]) {
    roles[nombre] = await Rol.create({ nombre, descripcion });
  }

  const cardio = await Especializacion.create({ nombre: 'Cardiología', descripcion: 'Enfermedades del corazón' });
  await Especializacion.create({ nombre: 'Medicina General', descripcion: 'Atención primaria' });
  await Especializacion.create({ nombre: 'Geriatría', descripcion: 'Atención del adulto mayor' });

  const paciente = await Usuario.create({
    nombre_completo: 'Paciente Demo',
    correo: 'paciente@saludtime.com',
    contrasena_hash: hash,
    edad: 72,
    telefono: '3001234567',
    estado: true,
    correo_verificado: true
  });

  const medico = await Usuario.create({
    nombre_completo: 'Dr. Médico Demo',
    correo: 'medico@saludtime.com',
    contrasena_hash: hash,
    edad: 45,
    telefono: '3007654321',
    estado: true,
    correo_verificado: true
  });

  const cuidador = await Usuario.create({
    nombre_completo: 'Cuidadora Demo',
    correo: 'cuidador@saludtime.com',
    contrasena_hash: hash,
    edad: 40,
    telefono: '3005555555',
    estado: true,
    correo_verificado: true
  });

  await UsuarioRol.bulkCreate([
    { id_usuario: paciente.id_usuario, id_rol: roles.PACIENTE.id_rol },
    { id_usuario: medico.id_usuario, id_rol: roles.MEDICO.id_rol },
    { id_usuario: cuidador.id_usuario, id_rol: roles.CUIDADOR.id_rol }
  ]);

  await MedicoEspecializacion.create({
    id_usuario: medico.id_usuario,
    id_especializacion: cardio.id_especializacion
  });

  await CuidadorPaciente.create({
    id_paciente: paciente.id_usuario,
    id_cuidador: cuidador.id_usuario,
    parentesco: 'Hija',
    estado: true
  });

  const losartan = await Medicamento.create({
    nombre: 'Losartán',
    presentacion: 'Tableta 50 mg',
    descripcion: 'Antihipertensivo',
    fecha_vencimiento: ymd(dia(365))
  });

  const metformina = await Medicamento.create({
    nombre: 'Metformina',
    presentacion: 'Tableta 850 mg',
    descripcion: 'Control de glucosa',
    fecha_vencimiento: ymd(dia(240))
  });

  const tratamiento = await Tratamiento.create({
    id_paciente: paciente.id_usuario,
    id_medicamento: losartan.id_medicamento,
    id_medico: medico.id_usuario,
    dosis: '1 tableta cada 12 horas',
    fecha_inicio: ymd(dia(-7)),
    fecha_fin: ymd(dia(30)),
    estado: true
  });

  await Tratamiento.create({
    id_paciente: paciente.id_usuario,
    id_medicamento: metformina.id_medicamento,
    id_medico: medico.id_usuario,
    dosis: '1 tableta con el desayuno',
    fecha_inicio: ymd(dia(-5)),
    fecha_fin: ymd(dia(25)),
    estado: true
  });

  const recordatorio = await Recordatorio.create({
    id_tratamiento: tratamiento.id_tratamiento,
    hora: '08:00:00',
    dias_semana: 'LUN,MAR,MIE,JUE,VIE,SAB,DOM',
    fecha_inicio: ymd(dia(-7)),
    fecha_fin: ymd(dia(30)),
    estado: true
  });

  const dosisHoyManana = await DosisProgramada.create({
    id_recordatorio: recordatorio.id_recordatorio,
    fecha_hora: hora(0, 8),
    estado: 'PENDIENTE'
  });

  await DosisProgramada.create({
    id_recordatorio: recordatorio.id_recordatorio,
    fecha_hora: hora(0, 20),
    estado: 'PENDIENTE'
  });

  const dosisTomada = await DosisProgramada.create({
    id_recordatorio: recordatorio.id_recordatorio,
    fecha_hora: hora(-1, 8),
    estado: 'TOMADA'
  });

  const dosisOmitida = await DosisProgramada.create({
    id_recordatorio: recordatorio.id_recordatorio,
    fecha_hora: hora(-1, 20),
    estado: 'OMITIDA'
  });

  await RegistroDosis.create({
    id_dosis_programada: dosisTomada.id_dosis_programada,
    fecha_confirmacion: hora(-1, 8, 5),
    observaciones: 'Tomada con el desayuno'
  });

  await RegistroDosis.create({
    id_dosis_programada: dosisOmitida.id_dosis_programada,
    fecha_confirmacion: hora(-1, 20, 30),
    observaciones: 'El paciente olvidó la dosis'
  });

  await Notificacion.create({
    id_dosis_programada: dosisOmitida.id_dosis_programada,
    id_usuario_destinatario: cuidador.id_usuario,
    tipo: 'DOSIS_OMITIDA',
    mensaje: 'El paciente no confirmó una dosis programada',
    estado: 'PENDIENTE'
  });

  console.log('\nDatos de demostración creados');
  console.log('----------------------------------------');
  console.log('Paciente : paciente@saludtime.com  (id', paciente.id_usuario + ')');
  console.log('Médico   : medico@saludtime.com    (id', medico.id_usuario + ')');
  console.log('Cuidador : cuidador@saludtime.com  (id', cuidador.id_usuario + ')');
  console.log('Contraseña para todos: ' + PASSWORD);
  console.log('Tratamiento id:', tratamiento.id_tratamiento);
  console.log('Recordatorio id:', recordatorio.id_recordatorio);
  console.log('Dosis pendiente de hoy (id:', dosisHoyManana.id_dosis_programada + ')');
  console.log('----------------------------------------');

  await sequelize.close();
}

main().catch(async (e) => {
  console.error('Error en el seed:', e);
  await sequelize.close();
  process.exit(1);
});
