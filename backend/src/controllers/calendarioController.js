const { Router } = require('express');
const endpoint = require('../http/endpoint');
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
// Orquestación de los casos de uso
// ==========================================

const obtener = async ({ params, query }) => {
  const { mes, anio } = query;

  const inicio = new Date(anio, mes - 1, 1);
  const fin = new Date(anio, mes, 0, 23, 59, 59);

  const tratamientos = await dosisDelPaciente(params.id_usuario, {
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

  return ok(new CalendarioResponseDTO({
    mes,
    anio,
    dias: Object.values(dias)
  }));
};

const porFecha = async ({ params, query }) => {
  const { fecha } = query;

  const [anio, mes, dia] = String(fecha).split('-').map(Number);
  const inicio = new Date(anio, mes - 1, dia, 0, 0, 0);
  const fin = new Date(anio, mes - 1, dia, 23, 59, 59);

  const tratamientos = await dosisDelPaciente(params.id_usuario, {
    fecha_hora: { [Op.between]: [inicio, fin] }
  });

  return ok(DosisProgramadaResponseDTO.fromList(aplanarDosis(tratamientos)));
};

const tomadas = async ({ params }) => {
  const dosis = await DosisProgramada.findAll({
    where: { estado: 'TOMADA' },
    include: includePorUsuario(params.id_usuario)
  });
  return ok(DosisProgramadaResponseDTO.fromList(dosis));
};

const omitidas = async ({ params }) => {
  const dosis = await DosisProgramada.findAll({
    where: { estado: 'OMITIDA' },
    include: includePorUsuario(params.id_usuario)
  });
  return ok(DosisProgramadaResponseDTO.fromList(dosis));
};

const historial = async ({ params }) => {
  const dosis = await DosisProgramada.findAll({
    include: includePorUsuario(params.id_usuario),
    order: [['fecha_hora', 'DESC']]
  });
  return ok(DosisProgramadaResponseDTO.fromList(dosis));
};

// ==========================================
// Endpoints definidos en el Controller
// ==========================================
router.get('/:id_usuario/fecha', validarId('id_usuario'), endpoint(porFecha, { query: CalendarioFechaQueryDTO }));
router.get('/:id_usuario/tomadas', validarId('id_usuario'), endpoint(tomadas));
router.get('/:id_usuario/omitidas', validarId('id_usuario'), endpoint(omitidas));
router.get('/:id_usuario/historial', validarId('id_usuario'), endpoint(historial));
router.get('/:id_usuario', validarId('id_usuario'), endpoint(obtener, { query: CalendarioQueryDTO }));

module.exports = router;
module.exports.obtener = obtener;
module.exports.porFecha = porFecha;
module.exports.tomadas = tomadas;
module.exports.omitidas = omitidas;
module.exports.historial = historial;
