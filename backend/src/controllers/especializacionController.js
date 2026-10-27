const { Router } = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const { Especializacion } = require('../models');
const EspecializacionResponseDTO = require('../dtos/especializacion/EspecializacionResponseDTO');
const { ok } = require('../views/response');

const router = Router();
const r = (handler) => asyncHandler(handler);

// Orquestación HTTP
const listar = async (req, res) => {
  const lista = await Especializacion.findAll();
  return ok(res, EspecializacionResponseDTO.fromList(lista));
};

// Endpoints definidos en el Controller
router.get('/', r(listar));

module.exports = router;
module.exports.listar = listar;
