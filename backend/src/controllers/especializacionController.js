const { Especializacion } = require('../models');
const EspecializacionResponseDTO = require('../dtos/especializacion/EspecializacionResponseDTO');
const { ok, error } = require('../views/response');

exports.listar = async (req, res) => {
  try {
    const lista = await Especializacion.findAll();
    return ok(res, EspecializacionResponseDTO.fromList(lista));
  } catch (e) {
    return error(res, 500, 'Error al listar especializaciones', e.message);
  }
};