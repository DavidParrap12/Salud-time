const { Router } = require('express');
const endpoint = require('../http/endpoint');
const validarId = require('../middlewares/validarId');
const { RegistroDosis, DosisProgramada, Recordatorio, Tratamiento } = require('../models');
const RegistroDosisResponseDTO = require('../dtos/registro/RegistroDosisResponseDTO');
const RegistrosQueryDTO = require('../dtos/registro/RegistrosQueryDTO');
const { ok } = require('../views/response');
const { NotFoundError } = require('../errors/AppError');

const router = Router();

// ==========================================
// Orquestación de los casos de uso
// ==========================================

const listar = async ({ query }) => {
  const { id_paciente } = query;

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
  return ok(RegistroDosisResponseDTO.fromList(registros));
};

const obtener = async ({ params }) => {
  const registro = await RegistroDosis.findByPk(params.id);
  if (!registro) throw new NotFoundError('Registro no encontrado');
  return ok(new RegistroDosisResponseDTO(registro));
};

// ==========================================
// Endpoints definidos en el Controller
// ==========================================
router.get('/', endpoint(listar, { query: RegistrosQueryDTO }));
router.get('/:id', validarId(), endpoint(obtener));

module.exports = router;
module.exports.listar = listar;
module.exports.obtener = obtener;
