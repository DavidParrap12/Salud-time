const { Op } = require('sequelize');
const { Tratamiento, Recordatorio, DosisProgramada } = require('../models');
const { BusinessError } = require('../errors/AppError');

const DIAS = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
const fecha = (valor) => {
  if (valor instanceof Date) return new Date(valor.getFullYear(), valor.getMonth(), valor.getDate());
  const [anio, mes, dia] = String(valor).slice(0, 10).split('-').map(Number);
  return new Date(anio, mes - 1, dia);
};

const fechasProgramadas = (recordatorio, desde, hasta) => {
  const dias = new Set(String(recordatorio.dias_semana).split(',').map((dia) => dia.trim().toUpperCase()));
  if (!dias.size || [...dias].some((dia) => !DIAS.includes(dia))) {
    throw new BusinessError('Los días deben ser DOM,LUN,MAR,MIE,JUE,VIE o SAB');
  }

  const inicio = new Date(Math.max(fecha(recordatorio.fecha_inicio), fecha(desde)));
  const fin = new Date(Math.min(
    recordatorio.fecha_fin ? fecha(recordatorio.fecha_fin) : fecha(hasta),
    fecha(hasta)
  ));
  const [hora, minuto, segundo = 0] = String(recordatorio.hora).split(':').map(Number);
  const resultado = [];
  for (const dia = inicio; dia <= fin; dia.setDate(dia.getDate() + 1)) {
    if (dias.has(DIAS[dia.getDay()])) {
      resultado.push(new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), hora, minuto, segundo));
    }
  }
  return resultado;
};

const programarRecordatorio = async (recordatorio, desde, hasta, transaction) => {
  if (!recordatorio.estado) return 0;
  const fechas = fechasProgramadas(recordatorio, desde, hasta);
  if (fechas.length) {
    await DosisProgramada.bulkCreate(
      fechas.map((fecha_hora) => ({ id_recordatorio: recordatorio.id_recordatorio, fecha_hora })),
      { ignoreDuplicates: true, transaction }
    );
  }
  return fechas.length;
};

const asegurarDosisPaciente = async (idPaciente, desde, hasta) => {
  const tratamientos = await Tratamiento.findAll({
    where: { id_paciente: idPaciente, estado: true },
    include: [{ model: Recordatorio, as: 'recordatorios', where: { estado: true }, required: false }]
  });
  for (const tratamiento of tratamientos) {
    for (const recordatorio of tratamiento.recordatorios || []) {
      await programarRecordatorio(recordatorio, desde, hasta);
    }
  }
};

const limpiarDosisFuturas = async (idRecordatorio, transaction) => {
  const hoy = fecha(new Date());
  await DosisProgramada.destroy({
    where: {
      id_recordatorio: idRecordatorio,
      estado: 'PENDIENTE',
      fecha_hora: { [Op.gte]: hoy }
    },
    transaction
  });
};

module.exports = { fechasProgramadas, programarRecordatorio, asegurarDosisPaciente, limpiarDosisFuturas };
