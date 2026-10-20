const { DosisProgramada, RegistroDosis, Notificacion, CuidadorPaciente, Recordatorio, Tratamiento } = require('../models');
const DosisProgramadaResponseDTO = require('../dtos/dosis/DosisProgramadaResponseDTO');
const ConfirmarDosisDTO          = require('../dtos/dosis/ConfirmarDosisDTO');
const OmitirDosisDTO             = require('../dtos/dosis/OmitirDosisDTO');
const { ok, created, error }     = require('../views/response');

exports.listarPendientes = async (req, res) => {
  try {
    const idPaciente = req.query.id_paciente || req.params.id_paciente;
    const includeOpts = idPaciente ? [{
      model: Recordatorio,
      as: 'recordatorio',
      required: true,
      include: [{
        model: Tratamiento,
        as: 'tratamiento',
        where: { id_paciente: idPaciente },
        required: true
      }]
    }] : [];

    const dosis = await DosisProgramada.findAll({
      where: { estado: 'PENDIENTE' },
      include: includeOpts
    });
    return ok(res, DosisProgramadaResponseDTO.fromList(dosis));
  } catch (e) {
    return error(res, 500, 'Error al listar dosis pendientes', e.message);
  }
};

exports.confirmar = async (req, res) => {
  try {
    const dosis = await DosisProgramada.findByPk(req.params.id);
    if (!dosis) return error(res, 404, 'Dosis no encontrada');
    if (dosis.estado !== 'PENDIENTE') return error(res, 400, 'La dosis ya fue registrada');

    const dto = new ConfirmarDosisDTO(req.body || {});
    const errores = dto.validar();
    if (errores.length) return error(res, 400, 'Datos inválidos', errores);

    await dosis.update({ estado: 'TOMADA' });
    const registro = await RegistroDosis.create({
      id_dosis_programada: dosis.id_dosis_programada,
      fecha_confirmacion: new Date(),
      observaciones: dto.observaciones
    });

    return created(res, { dosis, registro }, 'Dosis confirmada');
  } catch (e) {
    return error(res, 500, 'Error al confirmar dosis', e.message);
  }
};

exports.omitir = async (req, res) => {
  try {
    const dosis = await DosisProgramada.findByPk(req.params.id, {
      include: [{
        model: Recordatorio,
        as: 'recordatorio',
        include: [{ model: Tratamiento, as: 'tratamiento' }]
      }]
    });
    if (!dosis) return error(res, 404, 'Dosis no encontrada');
    if (dosis.estado !== 'PENDIENTE') return error(res, 400, 'La dosis ya fue registrada');

    const dto = new OmitirDosisDTO(req.body || {});
    const errores = dto.validar();
    if (errores.length) return error(res, 400, 'Datos inválidos', errores);

    await dosis.update({ estado: 'OMITIDA' });

    const registro = await RegistroDosis.create({
      id_dosis_programada: dosis.id_dosis_programada,
      fecha_confirmacion: new Date(),
      observaciones: dto.motivo
    });

    // Notificar a los cuidadores del paciente dueño del tratamiento.
    const idPaciente = dosis.recordatorio?.tratamiento?.id_paciente;
    if (idPaciente) {
      const relaciones = await CuidadorPaciente.findAll({
        where: { id_paciente: idPaciente, estado: true }
      });
      for (const rel of relaciones) {
        await Notificacion.create({
          id_dosis_programada: dosis.id_dosis_programada,
          id_usuario_destinatario: rel.id_cuidador,
          tipo: 'DOSIS_OMITIDA',
          mensaje: `El paciente no confirmó una dosis programada para ${dosis.fecha_hora}`,
          estado: 'PENDIENTE'
        });
      }
    }

    return created(res, { dosis, registro }, 'Dosis registrada como omitida');
  } catch (e) {
    return error(res, 500, 'Error al omitir dosis', e.message);
  }
};

exports.generarAlerta = async (req, res) => {
  try {
    const dosis = await DosisProgramada.findByPk(req.body.id_dosis_programada);
    if (!dosis) return error(res, 404, 'Dosis no encontrada');

    const notificacion = await Notificacion.create({
      id_dosis_programada: dosis.id_dosis_programada,
      id_usuario_destinatario: req.body.id_usuario_destinatario,
      tipo: 'RECORDATORIO',
      mensaje: `Recuerde tomar su medicamento programado para ${dosis.fecha_hora}`,
      estado: 'PENDIENTE'
    });

    return created(res, notificacion, 'Alerta generada');
  } catch (e) {
    return error(res, 500, 'Error al generar alerta', e.message);
  }
};
