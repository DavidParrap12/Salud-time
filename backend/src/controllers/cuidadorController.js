const CuidadorPaciente = require('../models/CuidadorPaciente');
const Usuario = require('../models/Usuario');

// DTOs
const CrearCuidadorDTO = require('../dtos/cuidador/CrearCuidadorDTO');

// ──────────────────────────────────────────────
// Asignar cuidador a un paciente
// ──────────────────────────────────────────────
const asignarCuidador = async (req, res) => {
  try {
    const dto = new CrearCuidadorDTO(req.body);
    const errores = dto.validar();
    if (errores.length) {
      return res.status(400).json({ ok: false, errores });
    }

    // Buscar al cuidador por su correo
    const cuidador = await Usuario.findOne({ where: { correo: dto.correo_cuidador } });
    if (!cuidador) {
      return res.status(404).json({
        ok: false,
        mensaje: 'No se encontró un usuario con ese correo de cuidador'
      });
    }

    // Verificar que no sea el mismo paciente
    if (cuidador.id_usuario === dto.id_paciente) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Un paciente no puede ser su propio cuidador'
      });
    }

    // Verificar si la relación ya existe
    const existente = await CuidadorPaciente.findOne({
      where: {
        id_paciente: dto.id_paciente,
        id_cuidador: cuidador.id_usuario
      }
    });

    if (existente) {
      // Si existe pero estaba desactivada, reactivar
      if (!existente.estado) {
        await existente.update({ estado: true, parentesco: dto.parentesco });
        return res.status(200).json({
          ok: true,
          mensaje: 'Relación de cuidador reactivada exitosamente',
          data: existente
        });
      }
      return res.status(400).json({
        ok: false,
        mensaje: 'Esta relación cuidador-paciente ya existe'
      });
    }

    const relacion = await CuidadorPaciente.create({
      id_paciente: dto.id_paciente,
      id_cuidador: cuidador.id_usuario,
      parentesco: dto.parentesco
    });

    return res.status(201).json({
      ok: true,
      mensaje: 'Cuidador asignado exitosamente',
      data: relacion
    });
  } catch (error) {
    console.error('Error en asignarCuidador:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// Obtener cuidadores de un paciente
// ──────────────────────────────────────────────
const obtenerCuidadoresPorPaciente = async (req, res) => {
  try {
    const cuidadores = await CuidadorPaciente.findAll({
      where: {
        id_paciente: req.params.id_paciente,
        estado: true
      }
    });

    return res.status(200).json({
      ok: true,
      data: cuidadores
    });
  } catch (error) {
    console.error('Error en obtenerCuidadoresPorPaciente:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// Eliminar relación cuidador-paciente (soft delete)
// ──────────────────────────────────────────────
const eliminarRelacion = async (req, res) => {
  try {
    const relacion = await CuidadorPaciente.findByPk(req.params.id);
    if (!relacion) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Relación cuidador-paciente no encontrada'
      });
    }

    await relacion.update({ estado: false });

    return res.status(200).json({
      ok: true,
      mensaje: 'Relación cuidador-paciente eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error en eliminarRelacion:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

module.exports = {
  asignarCuidador,
  obtenerCuidadoresPorPaciente,
  eliminarRelacion
};
