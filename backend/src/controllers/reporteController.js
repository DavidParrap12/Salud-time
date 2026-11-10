const { Router } = require('express');
const endpoint = require('../http/endpoint');
const validarId = require('../middlewares/validarId');
const { Tratamiento, Recordatorio, DosisProgramada, Usuario, Reporte } = require('../models');
const { Op } = require('sequelize');
const CrearReporteDTO = require('../dtos/reporte/CrearReporteDTO');
const CompartirReporteDTO = require('../dtos/reporte/CompartirReporteDTO');
const ReporteResponseDTO = require('../dtos/reporte/ReporteResponseDTO');
const ReporteEstadisticasResponseDTO = require('../dtos/reporte/ReporteEstadisticasResponseDTO');
const CumplimientoResponseDTO = require('../dtos/reporte/CumplimientoResponseDTO');
const CompartirReporteResponseDTO = require('../dtos/reporte/CompartirReporteResponseDTO');
const { ok, created } = require('../views/response');
const { NotFoundError } = require('../errors/AppError');
const { aFechaLocal } = require('../utils/fechas');

const router = Router();

const buscarReporte = async (id) => {
  const reporte = await Reporte.findByPk(id);
  if (!reporte) throw new NotFoundError('Reporte no encontrado');
  return reporte;
};

const porcentaje = (parte, total) =>
  total > 0 ? Number(((parte / total) * 100).toFixed(2)) : 0;

// ==========================================
// Orquestación de los casos de uso
// ==========================================

const generar = async ({ body: dto }) => {
  const usuario = await Usuario.findByPk(dto.id_usuario);
  if (!usuario) throw new NotFoundError('Usuario no encontrado');

  const tratamientos = await Tratamiento.findAll({
    where: { id_paciente: dto.id_usuario },
    include: [{
      model: Recordatorio,
      as: 'recordatorios',
      include: [{
        model: DosisProgramada,
        as: 'dosis',
        where: {
          fecha_hora: {
            [Op.between]: [aFechaLocal(dto.fecha_inicio), aFechaLocal(dto.fecha_fin, true)]
          }
        },
        required: false
      }]
    }]
  });

  let total = 0;
  let tomadas = 0;
  let omitidas = 0;

  for (const tratamiento of tratamientos) {
    for (const recordatorio of (tratamiento.recordatorios || [])) {
      for (const dosis of (recordatorio.dosis || [])) {
        total++;
        if (dosis.estado === 'TOMADA') tomadas++;
        if (dosis.estado === 'OMITIDA') omitidas++;
      }
    }
  }

  const reporte = await Reporte.create({
    id_usuario: dto.id_usuario,
    fecha_inicio: dto.fecha_inicio,
    fecha_fin: dto.fecha_fin,
    total,
    tomadas,
    omitidas,
    adherencia: porcentaje(tomadas, total)
  });

  return created(new ReporteResponseDTO(reporte), 'Reporte generado');
};

const obtener = async ({ params }) => {
  const reporte = await buscarReporte(params.id);
  return ok(new ReporteResponseDTO(reporte));
};

const estadisticas = async ({ params }) => {
  const reporte = await buscarReporte(params.id);
  const pendientes = Math.max(reporte.total - reporte.tomadas - reporte.omitidas, 0);

  return ok(new ReporteEstadisticasResponseDTO({
    reporte: new ReporteResponseDTO(reporte),
    pendientes,
    porcentaje_tomadas: porcentaje(reporte.tomadas, reporte.total),
    porcentaje_omitidas: porcentaje(reporte.omitidas, reporte.total)
  }));
};

const cumplimiento = async ({ params }) => {
  const reporte = await buscarReporte(params.id);

  let nivel = 'BAJA';
  let mensaje = 'La adherencia es baja; se recomienda seguimiento.';
  if (reporte.adherencia >= 90) {
    nivel = 'ALTA';
    mensaje = 'Excelente adherencia al tratamiento.';
  } else if (reporte.adherencia >= 70) {
    nivel = 'MEDIA';
    mensaje = 'Adherencia aceptable; hay dosis por mejorar.';
  }

  return ok(new CumplimientoResponseDTO({
    id_reporte: reporte.id_reporte,
    adherencia: reporte.adherencia,
    nivel,
    mensaje
  }));
};

const compartir = async ({ body: dto }) => {
  const reporte = await buscarReporte(dto.id_reporte);

  return ok(new CompartirReporteResponseDTO({
    id_reporte: reporte.id_reporte,
    correo_destino: dto.correo_destino,
    enviado: true
  }), `Reporte compartido con ${dto.correo_destino}`);
};

// ==========================================
// Endpoints definidos en el Controller
// ==========================================
router.post('/compartir', endpoint(compartir, { body: CompartirReporteDTO }));
router.post('/', endpoint(generar, { body: CrearReporteDTO }));
router.get('/:id/estadisticas', validarId(), endpoint(estadisticas));
router.get('/:id/cumplimiento', validarId(), endpoint(cumplimiento));
router.get('/:id', validarId(), endpoint(obtener));

module.exports = router;
module.exports.generar = generar;
module.exports.obtener = obtener;
module.exports.estadisticas = estadisticas;
module.exports.cumplimiento = cumplimiento;
module.exports.compartir = compartir;
