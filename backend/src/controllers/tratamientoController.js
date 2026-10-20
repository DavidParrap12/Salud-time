const { Tratamiento, Usuario, Medicamento } = require('../models');
const CrearTratamientoDTO      = require('../dtos/tratamiento/CrearTratamientoDTO');
const ActualizarTratamientoDTO = require('../dtos/tratamiento/ActualizarTratamientoDTO');
const TratamientoResponseDTO   = require('../dtos/tratamiento/TratamientoResponseDTO');
const { ok, created, error }   = require('../views/response');

exports.listarPorPaciente = async (req, res) => {
  try {
    const tratamientos = await Tratamiento.findAll({
      where: { id_paciente: req.params.id_paciente }
    });
    return ok(res, TratamientoResponseDTO.fromList(tratamientos));
  } catch (e) {
    return error(res, 500, 'Error al listar tratamientos', e.message);
  }
};

exports.obtener = async (req, res) => {
  try {
    const t = await Tratamiento.findByPk(req.params.id);
    if (!t) return error(res, 404, 'Tratamiento no encontrado');
    return ok(res, new TratamientoResponseDTO(t));
  } catch (e) {
    return error(res, 500, 'Error al obtener tratamiento', e.message);
  }
};

exports.crear = async (req, res) => {
  try {
    const dto = new CrearTratamientoDTO(req.body || {});
    const errores = dto.validar();
    if (errores.length) return error(res, 400, 'Datos inválidos', errores);

    const paciente = await Usuario.findByPk(dto.id_paciente);
    if (!paciente) return error(res, 404, 'Paciente no encontrado');

    const medicamento = await Medicamento.findByPk(dto.id_medicamento);
    if (!medicamento) return error(res, 404, 'Medicamento no encontrado');

    const t = await Tratamiento.create({
      id_paciente: dto.id_paciente,
      id_medicamento: dto.id_medicamento,
      id_medico: dto.id_medico,
      dosis: dto.dosis,
      fecha_inicio: dto.fecha_inicio,
      fecha_fin: dto.fecha_fin,
      estado: true
    });

    return created(res, new TratamientoResponseDTO(t), 'Tratamiento creado');
  } catch (e) {
    return error(res, 500, 'Error al crear tratamiento', e.message);
  }
};

exports.actualizar = async (req, res) => {
  try {
    const t = await Tratamiento.findByPk(req.params.id);
    if (!t) return error(res, 404, 'Tratamiento no encontrado');

    const dto = new ActualizarTratamientoDTO(req.body || {});
    const errores = dto.validar();
    if (errores.length) return error(res, 400, 'Datos inválidos', errores);

    await t.update({
      dosis:        dto.dosis        ?? t.dosis,
      fecha_inicio: dto.fecha_inicio ?? t.fecha_inicio,
      fecha_fin:    dto.fecha_fin    ?? t.fecha_fin,
      estado:       dto.estado       ?? t.estado
    });

    return ok(res, new TratamientoResponseDTO(t), 'Tratamiento actualizado');
  } catch (e) {
    return error(res, 500, 'Error al actualizar tratamiento', e.message);
  }
};

exports.desactivar = async (req, res) => {
  try {
    const t = await Tratamiento.findByPk(req.params.id);
    if (!t) return error(res, 404, 'Tratamiento no encontrado');
    await t.update({ estado: false });
    return ok(res, null, 'Tratamiento desactivado');
  } catch (e) {
    return error(res, 500, 'Error al desactivar tratamiento', e.message);
  }
};