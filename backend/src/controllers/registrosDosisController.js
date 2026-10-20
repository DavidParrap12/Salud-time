const { RegistroDosis, DosisProgramada, Recordatorio, Tratamiento } = require('../models');
const RegistroDosisResponseDTO = require('../dtos/registro/RegistroDosisResponseDTO');
const { ok, error } = require('../views/response');

exports.listar = async (req, res) => {
  try {
    const idPaciente = req.query.id_paciente || req.params.id_paciente;
    const includeOpts = idPaciente ? [{
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
          where: { id_paciente: idPaciente },
          required: true
        }]
      }]
    }] : [];

    const registros = await RegistroDosis.findAll({ include: includeOpts });
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
