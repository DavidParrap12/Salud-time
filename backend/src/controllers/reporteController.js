const { Op } = require('sequelize');
const Tratamiento = require('../models/Tratamiento');
const DosisProgramada = require('../models/DosisProgramada');

// DTOs
const CrearReporteDTO = require('../dtos/reportes/CrearReporteDTO');

// ──────────────────────────────────────────────
// Generar reporte de adherencia
// ──────────────────────────────────────────────
const generarReporte = async (req, res) => {
  try {
    const dto = new CrearReporteDTO(req.body);
    const errores = dto.validar();
    if (errores.length) {
      return res.status(400).json({ ok: false, errores });
    }

    // Obtener tratamientos del usuario
    const tratamientos = await Tratamiento.findAll({
      where: { id_paciente: dto.id_usuario }
    });

    if (!tratamientos.length) {
      return res.status(200).json({
        ok: true,
        mensaje: 'No se encontraron tratamientos para este usuario',
        data: {
          id_usuario: dto.id_usuario,
          fecha_inicio: dto.fecha_inicio,
          fecha_fin: dto.fecha_fin,
          total_dosis: 0,
          resumen: {},
          adherencia: 0
        }
      });
    }

    // Obtener dosis programadas en el rango de fechas
    // TODO: Ajustar la relación tratamiento → recordatorio → dosis_programada
    const fechaInicio = new Date(dto.fecha_inicio);
    const fechaFin = new Date(dto.fecha_fin);
    fechaFin.setHours(23, 59, 59, 999);

    const dosisEnRango = await DosisProgramada.findAll({
      where: {
        fecha_hora: {
          [Op.between]: [fechaInicio, fechaFin]
        }
      }
    });

    // Agrupar por estado
    const resumen = {
      PENDIENTE: 0,
      TOMADA: 0,
      OMITIDA: 0,
      POSPUESTA: 0
    };

    dosisEnRango.forEach(d => {
      if (resumen[d.estado] !== undefined) {
        resumen[d.estado]++;
      }
    });

    const totalDosis = dosisEnRango.length;
    const adherencia = totalDosis > 0
      ? Math.round((resumen.TOMADA / totalDosis) * 100 * 100) / 100
      : 0;

    return res.status(200).json({
      ok: true,
      data: {
        id_usuario: dto.id_usuario,
        fecha_inicio: dto.fecha_inicio,
        fecha_fin: dto.fecha_fin,
        total_dosis: totalDosis,
        resumen,
        adherencia, // porcentaje de dosis tomadas
        tratamientos_encontrados: tratamientos.length
      }
    });
  } catch (error) {
    console.error('Error en generarReporte:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

module.exports = {
  generarReporte
};
