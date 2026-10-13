const Tratamiento = require('../models/Tratamiento');

// DTOs
const CrearTratamientoDTO = require('../dtos/tratamiento/CrearTratamientoDTO');
const ActualizarTratamientoDTO = require('../dtos/tratamiento/ActualizarTratamientoDTO');
const TratamientoResponseDTO = require('../dtos/tratamiento/TratamientoResponseDTO');

// ──────────────────────────────────────────────
// Crear tratamiento
// ──────────────────────────────────────────────
const crear = async (req, res) => {
  try {
    const dto = new CrearTratamientoDTO(req.body);
    const errores = dto.validar();
    if (errores.length) {
      return res.status(400).json({ ok: false, errores });
    }

    const tratamiento = await Tratamiento.create({
      id_paciente: dto.id_paciente,
      id_medicamento: dto.id_medicamento,
      id_medico: dto.id_medico,
      dosis: dto.dosis,
      fecha_inicio: dto.fecha_inicio,
      fecha_fin: dto.fecha_fin
    });

    return res.status(201).json({
      ok: true,
      mensaje: 'Tratamiento creado exitosamente',
      data: new TratamientoResponseDTO(tratamiento)
    });
  } catch (error) {
    console.error('Error en crear tratamiento:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// Obtener todos los tratamientos (filtro opcional por paciente)
// ──────────────────────────────────────────────
const obtenerTodos = async (req, res) => {
  try {
    const where = {};
    // Filtro opcional por id_paciente vía query param
    if (req.query.id_paciente) {
      where.id_paciente = req.query.id_paciente;
    }

    const tratamientos = await Tratamiento.findAll({ where });

    return res.status(200).json({
      ok: true,
      data: TratamientoResponseDTO.fromList(tratamientos)
    });
  } catch (error) {
    console.error('Error en obtenerTodos tratamientos:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// Obtener tratamiento por ID
// ──────────────────────────────────────────────
const obtenerPorId = async (req, res) => {
  try {
    const tratamiento = await Tratamiento.findByPk(req.params.id);
    if (!tratamiento) {
      return res.status(404).json({ ok: false, mensaje: 'Tratamiento no encontrado' });
    }

    return res.status(200).json({
      ok: true,
      data: new TratamientoResponseDTO(tratamiento)
    });
  } catch (error) {
    console.error('Error en obtenerPorId tratamiento:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// Actualizar tratamiento (actualización parcial)
// ──────────────────────────────────────────────
const actualizar = async (req, res) => {
  try {
    const dto = new ActualizarTratamientoDTO(req.body);
    const errores = dto.validar();
    if (errores.length) {
      return res.status(400).json({ ok: false, errores });
    }

    const tratamiento = await Tratamiento.findByPk(req.params.id);
    if (!tratamiento) {
      return res.status(404).json({ ok: false, mensaje: 'Tratamiento no encontrado' });
    }

    // Filtrar solo los campos definidos para actualización parcial
    const camposActualizar = {};
    if (dto.dosis !== undefined) camposActualizar.dosis = dto.dosis;
    if (dto.fecha_inicio !== undefined) camposActualizar.fecha_inicio = dto.fecha_inicio;
    if (dto.fecha_fin !== undefined) camposActualizar.fecha_fin = dto.fecha_fin;
    if (dto.estado !== undefined) camposActualizar.estado = dto.estado;

    await tratamiento.update(camposActualizar);

    return res.status(200).json({
      ok: true,
      mensaje: 'Tratamiento actualizado exitosamente',
      data: new TratamientoResponseDTO(tratamiento)
    });
  } catch (error) {
    console.error('Error en actualizar tratamiento:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// Desactivar tratamiento (soft delete)
// ──────────────────────────────────────────────
const desactivar = async (req, res) => {
  try {
    const tratamiento = await Tratamiento.findByPk(req.params.id);
    if (!tratamiento) {
      return res.status(404).json({ ok: false, mensaje: 'Tratamiento no encontrado' });
    }

    await tratamiento.update({ estado: false });

    return res.status(200).json({
      ok: true,
      mensaje: 'Tratamiento desactivado exitosamente'
    });
  } catch (error) {
    console.error('Error en desactivar tratamiento:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

module.exports = {
  crear,
  obtenerTodos,
  obtenerPorId,
  actualizar,
  desactivar
};
