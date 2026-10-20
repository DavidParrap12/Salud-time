const { Medicamento } = require('../models');
const CrearMedicamentoDTO      = require('../dtos/medicamento/CrearMedicamentoDTO');
const ActualizarMedicamentoDTO = require('../dtos/medicamento/ActualizarMedicamentoDTO');
const MedicamentoResponseDTO   = require('../dtos/medicamento/MedicamentoResponseDTO');
const { ok, created, error }   = require('../views/response');

exports.listar = async (req, res) => {
  try {
    const medicamentos = await Medicamento.findAll({ where: { estado: true } });
    return ok(res, MedicamentoResponseDTO.fromList(medicamentos));
  } catch (e) {
    return error(res, 500, 'Error al listar medicamentos', e.message);
  }
};

exports.obtener = async (req, res) => {
  try {
    const med = await Medicamento.findByPk(req.params.id);
    if (!med) return error(res, 404, 'Medicamento no encontrado');
    return ok(res, new MedicamentoResponseDTO(med));
  } catch (e) {
    return error(res, 500, 'Error al obtener medicamento', e.message);
  }
};

exports.crear = async (req, res) => {
  try {
    const dto = new CrearMedicamentoDTO(req.body || {});
    const errores = dto.validar();
    if (errores.length) return error(res, 400, 'Datos inválidos', errores);

    const med = await Medicamento.create({
      nombre:            dto.nombre,
      presentacion:      dto.presentacion,
      descripcion:       dto.descripcion,
      fecha_vencimiento: dto.fecha_vencimiento
    });

    return created(res, new MedicamentoResponseDTO(med), 'Medicamento registrado');
  } catch (e) {
    return error(res, 500, 'Error al crear medicamento', e.message);
  }
};

exports.actualizar = async (req, res) => {
  try {
    const med = await Medicamento.findByPk(req.params.id);
    if (!med) return error(res, 404, 'Medicamento no encontrado');

    const dto = new ActualizarMedicamentoDTO(req.body || {});
    const errores = dto.validar();
    if (errores.length) return error(res, 400, 'Datos inválidos', errores);

    await med.update({
      nombre:            dto.nombre            ?? med.nombre,
      presentacion:      dto.presentacion      ?? med.presentacion,
      descripcion:       dto.descripcion       ?? med.descripcion,
      fecha_vencimiento: dto.fecha_vencimiento ?? med.fecha_vencimiento,
      estado:            dto.estado            ?? med.estado
    });

    return ok(res, new MedicamentoResponseDTO(med), 'Medicamento actualizado');
  } catch (e) {
    return error(res, 500, 'Error al actualizar medicamento', e.message);
  }
};

exports.eliminar = async (req, res) => {
  try {
    const med = await Medicamento.findByPk(req.params.id);
    if (!med) return error(res, 404, 'Medicamento no encontrado');
    await med.update({ estado: false });
    return ok(res, null, 'Medicamento desactivado');
  } catch (e) {
    return error(res, 500, 'Error al eliminar medicamento', e.message);
  }
};

exports.validar = async (req, res) => {
  try {
    const dto = new CrearMedicamentoDTO(req.body || {});
    const errores = dto.validar();
    return ok(res, { valido: errores.length === 0, errores });
  } catch (e) {
    return error(res, 500, 'Error al validar', e.message);
  }
};

exports.vencimiento = async (req, res) => {
  try {
    const med = await Medicamento.findByPk(req.params.id);
    if (!med) return error(res, 404, 'Medicamento no encontrado');
    return ok(res, { fecha_vencimiento: med.fecha_vencimiento });
  } catch (e) {
    return error(res, 500, 'Error al consultar vencimiento', e.message);
  }
};
