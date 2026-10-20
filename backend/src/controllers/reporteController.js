const { Tratamiento, Recordatorio, DosisProgramada, Usuario } = require('../models');
const CrearReporteDTO     = require('../dtos/reporte/CrearReporteDTO');
const ReporteResponseDTO  = require('../dtos/reporte/ReporteResponseDTO');
const { ok, created, error } = require('../views/response');
const { Op } = require('sequelize');

const aFechaLocal = (valor, finDelDia = false) => {
  const m = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return new Date(valor);
  return new Date(
    Number(m[1]), Number(m[2]) - 1, Number(m[3]),
    finDelDia ? 23 : 0, finDelDia ? 59 : 0, finDelDia ? 59 : 0
  );
};

exports.generar = async (req, res) => {
  try {
    const dto = new CrearReporteDTO(req.body || {});
    const errores = dto.validar();
    if (errores.length) return error(res, 400, 'Datos inválidos', errores);

    const usuario = await Usuario.findByPk(dto.id_usuario);
    if (!usuario) return error(res, 404, 'Usuario no encontrado');

    const tratamientos = await Tratamiento.findAll({
      where: { id_paciente: dto.id_usuario },
      include: [{
        model: Recordatorio, as: 'recordatorios',
        include: [{
          model: DosisProgramada, as: 'dosis',
          where: { fecha_hora: { [Op.between]: [aFechaLocal(dto.fecha_inicio), aFechaLocal(dto.fecha_fin, true)] } },
          required: false
        }]
      }]
    });

    let total = 0, tomadas = 0, omitidas = 0;
    for (const t of tratamientos)
      for (const r of (t.recordatorios || []))
        for (const d of (r.dosis || [])) {
          total++;
          if (d.estado === 'TOMADA') tomadas++;
          if (d.estado === 'OMITIDA') omitidas++;
        }

    const adherencia = total > 0 ? ((tomadas / total) * 100).toFixed(2) : 0;

    return created(res, new ReporteResponseDTO({
      id_usuario: dto.id_usuario,
      fecha_inicio: dto.fecha_inicio,
      fecha_fin: dto.fecha_fin,
      total, tomadas, omitidas, adherencia
    }), 'Reporte generado');
  } catch (e) {
    return error(res, 500, 'Error al generar reporte', e.message);
  }
};

exports.estadisticas = async (req, res) => {
  return ok(res, { mensaje: 'Estadísticas del reporte ' + req.params.id });
};

exports.cumplimiento = async (req, res) => {
  return ok(res, { mensaje: 'Cumplimiento del reporte ' + req.params.id });
};

exports.obtener = async (req, res) => {
  return ok(res, { mensaje: 'Reporte ' + req.params.id });
};

exports.compartir = async (req, res) => {
  try {
    const { correo_destino } = req.body;
    if (!correo_destino) return error(res, 400, 'El correo destino es obligatorio');
    // Aquí se enviaría el correo con el reporte adjunto.
    return ok(res, null, `Reporte compartido con ${correo_destino}`);
  } catch (e) {
    return error(res, 500, 'Error al compartir reporte', e.message);
  }
};