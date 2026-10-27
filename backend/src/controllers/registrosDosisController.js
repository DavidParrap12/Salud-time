const { Router } = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validarId = require('../middlewares/validarId');
const { RegistroDosis, DosisProgramada, Recordatorio, Tratamiento } = require('../models');
const RegistroDosisResponseDTO = require('../dtos/registro/RegistroDosisResponseDTO');
const RegistrosQueryDTO = require('../dtos/registro/RegistrosQueryDTO');
const { ok } = require('../views/response');
const { NotFoundError } = require('../errors/AppError');

const router = Router();
const r = (handler) => asyncHandler(handler);

// ==========================================
// Orquestación y validación HTTP
// ==========================================

const listar = async (req, res) => {
  // DTO de entrada: verifica formato JSON de query params
  const { id_paciente } = RegistrosQueryDTO.from(req.query);

  const include = id_paciente
    ? [{
        model: DosisProgramada,
        as: 'dosis',
        required: true,
        include: [{
          model: Recordatorio,
          as: 'recordatorio',
          required: true,
          include: [{
            model: Tratamiento,
            as: 'tratamiento',
            where: { id_paciente },
            required: true
          }]
        }]
      }]
    : [];

  const registros = await RegistroDosis.findAll({ include });
  return ok(res, RegistroDosisResponseDTO.fromList(registros));
};

const obtener = async (req, res) => {
  const registro = await RegistroDosis.findByPk(req.params.id);
  if (!registro) throw new NotFoundError('Registro no encontrado');
  return ok(res, new RegistroDosisResponseDTO(registro));
};

// ==========================================
// Endpoints definidos en el Controller
// ==========================================
router.get('/', r(listar));
router.get('/:id', validarId(), r(obtener));

module.exports = router;
module.exports.listar = listar;
module.exports.obtener = obtener;
