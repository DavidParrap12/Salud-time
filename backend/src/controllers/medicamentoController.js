// TODO: Crear el modelo ../models/medicamento.js para que este controller funcione
const Medicamento = require('../models/Medicamento');

// DTOs
const CrearMedicamentoDTO = require('../dtos/medicamentos/CrearMedicamentoDTO');
const ActualizarMedicamentoDTO = require('../dtos/medicamentos/ActualizarMedicamentoDTO');
const MedicamentoResponseDTO = require('../dtos/medicamentos/MedicamentoResponseDTO');

// ──────────────────────────────────────────────
// Crear medicamento
// ──────────────────────────────────────────────
const crear = async (req, res) => {
  try {
    const dto = new CrearMedicamentoDTO(req.body);
    const errores = dto.validar();
    if (errores.length) {
      return res.status(400).json({ ok: false, errores });
    }

    const medicamento = await Medicamento.create({
      nombre: dto.nombre,
      presentacion: dto.presentacion,
      descripcion: dto.descripcion
    });

    return res.status(201).json({
      ok: true,
      mensaje: 'Medicamento creado exitosamente',
      data: new MedicamentoResponseDTO(medicamento)
    });
  } catch (error) {
    console.error('Error en crear medicamento:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// Obtener todos los medicamentos (filtro opcional por estado)
// ──────────────────────────────────────────────
const obtenerTodos = async (req, res) => {
  try {
    const where = {};
    // Filtro opcional por estado vía query param (?estado=true o ?estado=false)
    if (req.query.estado !== undefined) {
      where.estado = req.query.estado === 'true';
    }

    const medicamentos = await Medicamento.findAll({ where });

    return res.status(200).json({
      ok: true,
      data: MedicamentoResponseDTO.fromList(medicamentos)
    });
  } catch (error) {
    console.error('Error en obtenerTodos medicamentos:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// Obtener medicamento por ID
// ──────────────────────────────────────────────
const obtenerPorId = async (req, res) => {
  try {
    const medicamento = await Medicamento.findByPk(req.params.id);
    if (!medicamento) {
      return res.status(404).json({ ok: false, mensaje: 'Medicamento no encontrado' });
    }

    return res.status(200).json({
      ok: true,
      data: new MedicamentoResponseDTO(medicamento)
    });
  } catch (error) {
    console.error('Error en obtenerPorId medicamento:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// Actualizar medicamento (actualización parcial)
// ──────────────────────────────────────────────
const actualizar = async (req, res) => {
  try {
    const dto = new ActualizarMedicamentoDTO(req.body);
    const errores = dto.validar();
    if (errores.length) {
      return res.status(400).json({ ok: false, errores });
    }

    const medicamento = await Medicamento.findByPk(req.params.id);
    if (!medicamento) {
      return res.status(404).json({ ok: false, mensaje: 'Medicamento no encontrado' });
    }

    // Filtrar solo los campos definidos para actualización parcial
    const camposActualizar = {};
    if (dto.nombre !== undefined) camposActualizar.nombre = dto.nombre;
    if (dto.presentacion !== undefined) camposActualizar.presentacion = dto.presentacion;
    if (dto.descripcion !== undefined) camposActualizar.descripcion = dto.descripcion;
    if (dto.estado !== undefined) camposActualizar.estado = dto.estado;

    await medicamento.update(camposActualizar);

    return res.status(200).json({
      ok: true,
      mensaje: 'Medicamento actualizado exitosamente',
      data: new MedicamentoResponseDTO(medicamento)
    });
  } catch (error) {
    console.error('Error en actualizar medicamento:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// Eliminar medicamento (soft delete - desactivar)
// ──────────────────────────────────────────────
const eliminar = async (req, res) => {
  try {
    const medicamento = await Medicamento.findByPk(req.params.id);
    if (!medicamento) {
      return res.status(404).json({ ok: false, mensaje: 'Medicamento no encontrado' });
    }

    await medicamento.update({ estado: false });

    return res.status(200).json({
      ok: true,
      mensaje: 'Medicamento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en eliminar medicamento:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

module.exports = {
  crear,
  obtenerTodos,
  obtenerPorId,
  actualizar,
  eliminar
};
