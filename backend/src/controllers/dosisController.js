const { Router } = require('express');
const endpoint = require('../http/endpoint');
const validarId = require('../middlewares/validarId');
const {
  DosisProgramada,
  RegistroDosis,
  Notificacion,
  CuidadorPaciente,
  Recordatorio,
  Tratamiento
} = require('../models');
const DosisProgramadaResponseDTO = require('../dtos/dosis/DosisProgramadaResponseDTO');
const DosisRegistradaResponseDTO = require('../dtos/dosis/DosisRegistradaResponseDTO');
const DosisPendientesQueryDTO = require('../dtos/dosis/DosisPendientesQueryDTO');
const ConfirmarDosisDTO = require('../dtos/dosis/ConfirmarDosisDTO');
const OmitirDosisDTO = require('../dtos/dosis/OmitirDosisDTO');
const GenerarAlertaDTO = require('../dtos/dosis/GenerarAlertaDTO');
const NotificacionResponseDTO = require('../dtos/notificacion/NotificacionResponseDTO');
const { ok, created } = require('../views/response');
const { BusinessError, ForbiddenError, NotFoundError } = require('../errors/AppError');
const enTransaccion = require('../utils/transaccion');
const { exigirPropietario } = require('../utils/acceso');
const { asegurarDosisPaciente } = require('../utils/programarDosis');

const router = Router();

const buscarDosis = async (id, { transaction } = {}) => {
  const include = [{
    model: Recordatorio,
    as: 'recordatorio',
    include: [{ model: Tratamiento, as: 'tratamiento' }]
  }];

  const dosis = await DosisProgramada.findByPk(id, { include, transaction });
  if (!dosis) throw new NotFoundError('Dosis no encontrada');
  if (dosis.estado !== 'PENDIENTE') throw new BusinessError('La dosis ya fue registrada');
  return dosis;
};

// ==========================================
// Orquestación de los casos de uso
// ==========================================

const listarPendientes = async ({ query, usuario: actor }) => {
  const id_paciente = query.id_paciente || actor.id_usuario;
  exigirPropietario(actor, id_paciente);
  const fin = new Date();
  fin.setDate(fin.getDate() + 30);
  await asegurarDosisPaciente(id_paciente, new Date(), fin);

  const include = [{
        model: Recordatorio,
        as: 'recordatorio',
        required: true,
        include: [{
          model: Tratamiento,
          as: 'tratamiento',
          where: { id_paciente },
          required: true
        }]
      }];

  const dosis = await DosisProgramada.findAll({
    where: { estado: 'PENDIENTE' },
    include
  });

  return ok(DosisProgramadaResponseDTO.fromList(dosis));
};

const confirmar = async ({ params, body: dto, usuario: actor }) => {
  const resultado = await enTransaccion(async (transaction) => {
    const dosis = await buscarDosis(params.id, { transaction });
    exigirPropietario(actor, dosis.recordatorio.tratamiento.id_paciente);

    await dosis.update({ estado: 'TOMADA' }, { transaction });

    const registro = await RegistroDosis.create({
      id_dosis_programada: dosis.id_dosis_programada,
      fecha_confirmacion: new Date(),
      observaciones: dto.observaciones
    }, { transaction });

    return { dosis, registro };
  });

  return created(new DosisRegistradaResponseDTO(resultado), 'Dosis confirmada');
};

const omitir = async ({ params, body: dto, usuario: actor }) => {
  const resultado = await enTransaccion(async (transaction) => {
    const dosis = await buscarDosis(params.id, { transaction });
    exigirPropietario(actor, dosis.recordatorio.tratamiento.id_paciente);

    await dosis.update({ estado: 'OMITIDA' }, { transaction });

    const registro = await RegistroDosis.create({
      id_dosis_programada: dosis.id_dosis_programada,
      fecha_confirmacion: new Date(),
      observaciones: dto.motivo
    }, { transaction });

    const idPaciente = dosis.recordatorio?.tratamiento?.id_paciente;
    if (idPaciente) {
      const cuidadores = await CuidadorPaciente.findAll({
        where: { id_paciente: idPaciente, estado: true },
        transaction
      });

      for (const relacion of cuidadores) {
        await Notificacion.create({
          id_dosis_programada: dosis.id_dosis_programada,
          id_usuario_destinatario: relacion.id_cuidador,
          tipo: 'DOSIS_OMITIDA',
          mensaje: `El paciente no confirmó una dosis programada para ${dosis.fecha_hora}`,
          estado: 'PENDIENTE'
        }, { transaction });
      }
    }

    return { dosis, registro };
  });

  return created(new DosisRegistradaResponseDTO(resultado), 'Dosis registrada como omitida');
};

const generarAlerta = async ({ body: dto, usuario: actor }) => {
  const dosis = await DosisProgramada.findByPk(dto.id_dosis_programada, {
    include: [{ model: Recordatorio, as: 'recordatorio', include: [{ model: Tratamiento, as: 'tratamiento' }] }]
  });
  if (!dosis) throw new NotFoundError('Dosis no encontrada');
  exigirPropietario(actor, dosis.recordatorio.tratamiento.id_paciente);

  if (Number(dto.id_usuario_destinatario) !== Number(actor.id_usuario)) {
    const relacion = await CuidadorPaciente.findOne({
      where: {
        id_paciente: actor.id_usuario,
        id_cuidador: dto.id_usuario_destinatario,
        estado: true
      }
    });
    if (!relacion) throw new ForbiddenError('El destinatario no es un cuidador autorizado');
  }

  const notificacion = await Notificacion.create({
    id_dosis_programada: dosis.id_dosis_programada,
    id_usuario_destinatario: dto.id_usuario_destinatario,
    tipo: 'RECORDATORIO',
    mensaje: `Recuerde tomar su medicamento programado para ${dosis.fecha_hora}`,
    estado: 'PENDIENTE'
  });

  return created(new NotificacionResponseDTO(notificacion), 'Alerta generada');
};

// ==========================================
// Endpoints definidos en el Controller
// ==========================================
router.get('/pendientes', endpoint(listarPendientes, { query: DosisPendientesQueryDTO }));
router.post('/alerta', endpoint(generarAlerta, { body: GenerarAlertaDTO }));
router.post('/:id/confirmar', validarId(), endpoint(confirmar, { body: ConfirmarDosisDTO }));
router.post('/:id/omitir', validarId(), endpoint(omitir, { body: OmitirDosisDTO }));

module.exports = router;
module.exports.listarPendientes = listarPendientes;
module.exports.confirmar = confirmar;
module.exports.omitir = omitir;
module.exports.generarAlerta = generarAlerta;
