const { Router } = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validarId = require('../middlewares/validarId');
const { Tratamiento, Recordatorio, DosisProgramada } = require('../models');
const CalendarioResponseDTO = require('../dtos/calendario/CalendarioResponseDTO');
const CalendarioQueryDTO = require('../dtos/calendario/CalendarioQueryDTO');
const CalendarioFechaQueryDTO = require('../dtos/calendario/CalendarioFechaQueryDTO');
const DosisProgramadaResponseDTO = require('../dtos/dosis/DosisProgramadaResponseDTO');
const { ok } = require('../views/response');
const { Op } = require('sequelize');
const { fechaLocal } = require('../utils/fechas');

const router = Router();
const r = (handler) => asyncHandler(handler);

const dosisDelPaciente = async (idUsuario, whereDosis) => {
  return Tratamiento.findAll({
    where: { id_paciente: idUsuario, estado: true },
    include: [{
      model: Recordatorio,
      as: 'recordatorios',
      include: [{
        model: DosisProgramada,
        as: 'dosis',
        where: whereDosis,
        required: false
      }]
    }]
  });
};

const aplanarDosis = (tratamientos) => {
  const resultado = [];
  for (const t of tratamientos) {
    for (const r of (t.recordatorios || [])) {
      for (const d of (r.dosis || [])) resultado.push(d);
    }
  }
  return resultado;
};

const includePorUsuario = (idUsuario) => [{
  model: Recordatorio,
  as: 'recordatorio',
  required: true,
  include: [{
    model: Tratamiento,
    as: 'tratamiento',
    where: { id_paciente: idUsuario },
    required: true
  }]
}];

// ==========================================
// Orquestación y validación HTTP
// ==========================================

const obtener = async (req, res) => {
  const { id_usuario } = req.params;
  // DTO de entrada: verifica formato JSON de query params
  const { mes, anio } = CalendarioQueryDTO.from(req.query);

  const inicio = new Date(anio, mes - 1, 1);
  const fin = new Date(anio, mes, 0, 23, 59, 59);

  const tratamientos = await dosisDelPaciente(id_usuario, {
    fecha_hora: { [Op.between]: [inicio, fin] }
  });

  const dias = {};
  for (const d of aplanarDosis(tratamientos)) {
    const fecha = fechaLocal(d.fecha_hora);
    if (!dias[fecha]) dias[fecha] = { fecha, tomadas: 0, omitidas: 0, total: 0 };
    dias[fecha].total++;
    if (d.estado === 'TOMADA') dias[fecha].tomadas++;
    if (d.estado === 'OMITIDA') dias[fecha].omitidas++;
  }

  // DTO de salida: verifica y da formato JSON al resultado
  return ok(res, new CalendarioResponseDTO({
    mes,
    anio,
    dias: Object.values(dias)
  }));
};

const porFecha = async (req, res) => {
  const { id_usuario } = req.params;
  // DTO de entrada: verifica formato JSON de query params
  const { fecha } = CalendarioFechaQueryDTO.from(req.query);

  const [anio, mes, dia] = String(fecha).split('-').map(Number);
  const inicio = new Date(anio, mes - 1, dia, 0, 0, 0);
  const fin = new Date(anio, mes - 1, dia, 23, 59, 59);

  const tratamientos = await dosisDelPaciente(id_usuario, {
    fecha_hora: { [Op.between]: [inicio, fin] }
  });

  // DTO de salida: verifica JSON
  return ok(res, DosisProgramadaResponseDTO.fromList(aplanarDosis(tratamientos)));
};

const tomadas = async (req, res) => {
  const dosis = await DosisProgramada.findAll({
    where: { estado: 'TOMADA' },
    include: includePorUsuario(req.params.id_usuario)
  });
  return ok(res, DosisProgramadaResponseDTO.fromList(dosis));
};

const omitidas = async (req, res) => {
  const dosis = await DosisProgramada.findAll({
    where: { estado: 'OMITIDA' },
    include: includePorUsuario(req.params.id_usuario)
  });
  return ok(res, DosisProgramadaResponseDTO.fromList(dosis));
};

const historial = async (req, res) => {
  const dosis = await DosisProgramada.findAll({
    include: includePorUsuario(req.params.id_usuario),
    order: [['fecha_hora', 'DESC']]
  });
  return ok(res, DosisProgramadaResponseDTO.fromList(dosis));
};

// ==========================================
// Endpoints definidos en el Controller
// ==========================================
router.get('/:id_usuario/fecha', validarId('id_usuario'), r(porFecha));
router.get('/:id_usuario/tomadas', validarId('id_usuario'), r(tomadas));
router.get('/:id_usuario/omitidas', validarId('id_usuario'), r(omitidas));
router.get('/:id_usuario/historial', validarId('id_usuario'), r(historial));
router.get('/:id_usuario', validarId('id_usuario'), r(obtener));

module.exports = router;
module.exports.obtener = obtener;
module.exports.porFecha = porFecha;
module.exports.tomadas = tomadas;
module.exports.omitidas = omitidas;
module.exports.historial = historial;
