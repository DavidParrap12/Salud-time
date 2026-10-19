const { Tratamiento, Recordatorio, DosisProgramada } = require('../models');
const CalendarioResponseDTO = require('../dtos/calendario/CalendarioResponseDTO');
const { ok, error }         = require('../views/response');
const { Op } = require('sequelize');

exports.obtener = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { mes, anio } = req.query;

    const inicio = new Date(anio, mes - 1, 1);
    const fin    = new Date(anio, mes, 0, 23, 59, 59);

    const tratamientos = await Tratamiento.findAll({
      where: { id_paciente: id_usuario, estado: true },
      include: [{
        model: Recordatorio, as: 'recordatorios',
        include: [{ model: DosisProgramada, as: 'dosis', where: { fecha_hora: { [Op.between]: [inicio, fin] } }, required: false }]
      }]
    });

    const dias = {};
    for (const t of tratamientos) {
      for (const r of t.recordatorios) {
        for (const d of r.dosis) {
          const fecha = d.fecha_hora.toISOString().split('T')[0];
          if (!dias[fecha]) dias[fecha] = { fecha, tomadas: 0, omitidas: 0, total: 0 };
          dias[fecha].total++;
          if (d.estado === 'TOMADA') dias[fecha].tomadas++;
          if (d.estado === 'OMITIDA') dias[fecha].omitidas++;
        }
      }
    }

    return ok(res, new CalendarioResponseDTO({
      mes, anio, dias: Object.values(dias)
    }));
  } catch (e) {
    return error(res, 500, 'Error al obtener calendario', e.message);
  }
};

exports.porFecha = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { fecha } = req.query;
    const dia = new Date(fecha);
    const inicio = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), 0, 0, 0);
    const fin    = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), 23, 59, 59);

    const tratamientos = await Tratamiento.findAll({
      where: { id_paciente: id_usuario, estado: true },
      include: [{
        model: Recordatorio, as: 'recordatorios',
        include: [{ model: DosisProgramada, as: 'dosis', where: { fecha_hora: { [Op.between]: [inicio, fin] } }, required: false }]
      }]
    });

    const resultado = [];
    for (const t of tratamientos)
      for (const r of t.recordatorios)
        for (const d of r.dosis) resultado.push(d);

    return ok(res, resultado);
  } catch (e) {
    return error(res, 500, 'Error al consultar por fecha', e.message);
  }
};

exports.tomadas = async (req, res) => {
  try {
    const dosis = await DosisProgramada.findAll({ where: { estado: 'TOMADA' } });
    return ok(res, dosis);
  } catch (e) {
    return error(res, 500, 'Error al listar tomadas', e.message);
  }
};

exports.omitidas = async (req, res) => {
  try {
    const dosis = await DosisProgramada.findAll({ where: { estado: 'OMITIDA' } });
    return ok(res, dosis);
  } catch (e) {
    return error(res, 500, 'Error al listar omitidas', e.message);
  }
};

exports.historial = async (req, res) => {
  try {
    const dosis = await DosisProgramada.findAll({ order: [['fecha_hora', 'DESC']] });
    return ok(res, dosis);
  } catch (e) {
    return error(res, 500, 'Error al obtener historial', e.message);
  }
};