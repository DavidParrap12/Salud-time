const { Router } = require('express');
const endpoint = require('../http/endpoint');
const { Especializacion } = require('../models');
const EspecializacionResponseDTO = require('../dtos/especializacion/EspecializacionResponseDTO');
const { ok } = require('../views/response');

const router = Router();

// ==========================================
// Orquestación de los casos de uso
// ==========================================

const listar = async () => {
  const lista = await Especializacion.findAll();
  return ok(EspecializacionResponseDTO.fromList(lista));
};

// ==========================================
// Endpoints definidos en el Controller
// ==========================================
router.get('/', endpoint(listar));

module.exports = router;
module.exports.listar = listar;
