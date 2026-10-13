const DosisProgramada = require('../models/DosisProgramada');

// Estados válidos para las dosis
const ESTADOS_VALIDOS = ['PENDIENTE', 'TOMADA', 'OMITIDA', 'POSPUESTA'];

// ──────────────────────────────────────────────
// Obtener dosis por recordatorio
// ──────────────────────────────────────────────
const obtenerPorRecordatorio = async (req, res) => {
  try {
    const dosis = await DosisProgramada.findAll({
      where: { id_recordatorio: req.params.id_recordatorio },
      order: [['fecha_hora', 'ASC']]
    });

    return res.status(200).json({
      ok: true,
      data: dosis
    });
  } catch (error) {
    console.error('Error en obtenerPorRecordatorio:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// Actualizar estado de una dosis programada
// ──────────────────────────────────────────────
const actualizarEstado = async (req, res) => {
  try {
    const { estado } = req.body;

    // Validar que el estado sea uno de los permitidos
    if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({
        ok: false,
        mensaje: `El estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`
      });
    }

    const dosis = await DosisProgramada.findByPk(req.params.id);
    if (!dosis) {
      return res.status(404).json({ ok: false, mensaje: 'Dosis programada no encontrada' });
    }

    await dosis.update({ estado });

    return res.status(200).json({
      ok: true,
      mensaje: 'Estado de dosis actualizado exitosamente',
      data: dosis
    });
  } catch (error) {
    console.error('Error en actualizarEstado:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// Obtener dosis pendientes (filtro opcional por recordatorio)
// ──────────────────────────────────────────────
const obtenerPendientes = async (req, res) => {
  try {
    const where = { estado: 'PENDIENTE' };

    // Filtro opcional por id_recordatorio
    if (req.query.id_recordatorio) {
      where.id_recordatorio = req.query.id_recordatorio;
    }

    const dosis = await DosisProgramada.findAll({
      where,
      order: [['fecha_hora', 'ASC']]
    });

    return res.status(200).json({
      ok: true,
      data: dosis
    });
  } catch (error) {
    console.error('Error en obtenerPendientes:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

module.exports = {
  obtenerPorRecordatorio,
  actualizarEstado,
  obtenerPendientes
};
