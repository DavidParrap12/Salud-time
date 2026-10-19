const { RegistroDosis } = require('../models');
const RegistroDosisResponseDTO = require('../dtos/registro/RegistroDosisResponseDTO');
const { ok, error } = require('../views/response');

exports.listar = async (req, res) => {
  try {
    const registros = await RegistroDosis.findAll();
    return ok(res, RegistroDosisResponseDTO.fromList(registros));
  } catch (e) {
    return error(res, 500, 'Error al listar registros', e.message);
  }
};

exports.obtener = async (req, res) => {
  try {
    const reg = await RegistroDosis.findByPk(req.params.id);
    if (!reg) return error(res, 404, 'Registro no encontrado');
    return ok(res, new RegistroDosisResponseDTO(reg));
  } catch (e) {
    return error(res, 500, 'Error al obtener registro', e.message);
  }
};