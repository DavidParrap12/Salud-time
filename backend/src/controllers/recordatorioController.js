const { Recordatorio, Tratamiento } = require('../models');
const CrearRecordatorioDTO      = require('../dtos/recordatorio/CrearRecordatorioDTO');
const ActualizarRecordatorioDTO = require('../dtos/recordatorio/ActualizarRecordatorioDTO');
const RecordatorioResponseDTO   = require('../dtos/recordatorio/RecordatorioResponseDTO');
const { ok, created, error }    = require('../views/response');

exports.listarPorTratamiento = async (req, res) => {
  try {
    const lista = await Recordatorio.findAll({
      where: { id_tratamiento: req.params.id_tratamiento }
    });
    return ok(res, RecordatorioResponseDTO.fromList(lista));
  } catch (e) {
    return error(res, 500, 'Error al listar recordatorios', e.message);
  }
};

exports.crear = async (req, res) => {
  try {
    const dto = new CrearRecordatorioDTO(req.body || {});
    const errores = dto.validar();
    if (errores.length) return error(res, 400, 'Datos inválidos', errores);

    const t = await Tratamiento.findByPk(dto.id_tratamiento);
    if (!t) return error(res, 404, 'Tratamiento no encontrado');

    const r = await Recordatorio.create({
      id_tratamiento: dto.id_tratamiento,
      hora:           dto.hora,
      dias_semana:    dto.dias_semana,
      fecha_inicio:   dto.fecha_inicio,
      fecha_fin:      dto.fecha_fin,
      estado:         true
    });

    return created(res, new RecordatorioResponseDTO(r), 'Recordatorio creado');
  } catch (e) {
    return error(res, 500, 'Error al crear recordatorio', e.message);
  }
};

exports.actualizar = async (req, res) => {
  try {
    const r = await Recordatorio.findByPk(req.params.id);
    if (!r) return error(res, 404, 'Recordatorio no encontrado');

    const dto = new ActualizarRecordatorioDTO(req.body || {});
    const errores = dto.validar();
    if (errores.length) return error(res, 400, 'Datos inválidos', errores);

    await r.update({
      hora:         dto.hora         ?? r.hora,
      dias_semana:  dto.dias_semana  ?? r.dias_semana,
      fecha_inicio: dto.fecha_inicio ?? r.fecha_inicio,
      fecha_fin:    dto.fecha_fin    ?? r.fecha_fin,
      estado:       dto.estado       ?? r.estado
    });

    return ok(res, new RecordatorioResponseDTO(r), 'Recordatorio actualizado');
  } catch (e) {
    return error(res, 500, 'Error al actualizar recordatorio', e.message);
  }
};

exports.eliminar = async (req, res) => {
  try {
    const r = await Recordatorio.findByPk(req.params.id);
    if (!r) return error(res, 404, 'Recordatorio no encontrado');
    await r.update({ estado: false });
    return ok(res, null, 'Recordatorio desactivado');
  } catch (e) {
    return error(res, 500, 'Error al eliminar recordatorio', e.message);
  }
};

exports.cambiarHora = async (req, res) => {
  try {
    const r = await Recordatorio.findByPk(req.params.id);
    if (!r) return error(res, 404, 'Recordatorio no encontrado');
    if (!req.body.hora) return error(res, 400, 'La hora es obligatoria');
    await r.update({ hora: req.body.hora });
    return ok(res, new RecordatorioResponseDTO(r), 'Hora actualizada');
  } catch (e) {
    return error(res, 500, 'Error al actualizar hora', e.message);
  }
};

exports.cambiarDias = async (req, res) => {
  try {
    const r = await Recordatorio.findByPk(req.params.id);
    if (!r) return error(res, 404, 'Recordatorio no encontrado');
    if (!req.body.dias_semana) return error(res, 400, 'Los días son obligatorios');
    await r.update({ dias_semana: req.body.dias_semana });
    return ok(res, new RecordatorioResponseDTO(r), 'Días actualizados');
  } catch (e) {
    return error(res, 500, 'Error al actualizar días', e.message);
  }
};

exports.cambiarMedicamento = async (req, res) => {
  try {
    // En el modelo nuevo, el medicamento ya no se cambia directamente aquí:
    // el recordatorio depende del tratamiento.
    return error(res, 400, 'Para cambiar el medicamento, actualice el tratamiento asociado');
  } catch (e) {
    return error(res, 500, 'Error al actualizar medicamento', e.message);
  }
};