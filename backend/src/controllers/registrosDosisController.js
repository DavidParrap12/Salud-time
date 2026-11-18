const { Router } = require('express');
const endpoint = require('../http/endpoint');
const validarId = require('../middlewares/validarId');
const { RegistroDosis, DosisProgramada, Recordatorio, Tratamiento } = require('../models');
const RegistroDosisResponseDTO = require('../dtos/registro/RegistroDosisResponseDTO');
const RegistrosQueryDTO = require('../dtos/registro/RegistrosQueryDTO');
const { ok } = require('../views/response');
const { NotFoundError } = require('../errors/AppError');
const { exigirPropietario } = require('../utils/acceso');

const router = Router();

// ==========================================
// Orquestación de los casos de uso
// ==========================================

const listar = async ({ query, usuario: actor }) => {
  const id_paciente = query.id_paciente || actor.id_usuario;
  exigirPropietario(actor, id_paciente);

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

const obtener = async ({ params, usuario: actor }) => {
  const registro = await RegistroDosis.findByPk(params.id, {
    include: [{ model: DosisProgramada, as: 'dosis', include: [{
      model: Recordatorio, as: 'recordatorio', include: [{ model: Tratamiento, as: 'tratamiento' }]
    }] }]
  });
  if (!registro) throw new NotFoundError('Registro no encontrado');
  exigirPropietario(actor, registro.dosis.recordatorio.tratamiento.id_paciente);
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
