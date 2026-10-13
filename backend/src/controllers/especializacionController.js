// TODO: Crear el modelo ../models/especializacion.js para que este controller funcione
const Especializacion = require('../models/Especializacion');

// DTOs
const EspecializacionResponseDTO = require('../dtos/especialización/EspecializacionResponseDTO');

// ──────────────────────────────────────────────
// Obtener todas las especializaciones
// ──────────────────────────────────────────────
const obtenerTodas = async (req, res) => {
  try {
    const especializaciones = await Especializacion.findAll();

    return res.status(200).json({
      ok: true,
      data: EspecializacionResponseDTO.fromList(especializaciones)
    });
  } catch (error) {
    console.error('Error en obtenerTodas especializaciones:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// Obtener especialización por ID
// ──────────────────────────────────────────────
const obtenerPorId = async (req, res) => {
  try {
    const especializacion = await Especializacion.findByPk(req.params.id);
    if (!especializacion) {
      return res.status(404).json({ ok: false, mensaje: 'Especialización no encontrada' });
    }

    return res.status(200).json({
      ok: true,
      data: new EspecializacionResponseDTO(especializacion)
    });
  } catch (error) {
    console.error('Error en obtenerPorId especialización:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

module.exports = {
  obtenerTodas,
  obtenerPorId
};
