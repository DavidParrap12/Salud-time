const { Router } = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
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
const { BusinessError, NotFoundError } = require('../errors/AppError');
const enTransaccion = require('../utils/transaccion');

const router = Router();
const r = (handler) => asyncHandler(handler);

const buscarDosis = async (id, { conRelaciones = false, transaction } = {}) => {
  const include = conRelaciones
    ? [{
        model: Recordatorio,
        as: 'recordatorio',
        include: [{ model: Tratamiento, as: 'tratamiento' }]
      }]
    : [];

  const dosis = await DosisProgramada.findByPk(id, { include, transaction });
  if (!dosis) throw new NotFoundError('Dosis no encontrada');
  if (dosis.estado !== 'PENDIENTE') throw new BusinessError('La dosis ya fue registrada');
  return dosis;
};

// ==========================================
// Orquestación y validación HTTP
// ==========================================

const listarPendientes = async (req, res) => {
  // DTO de entrada: verifica formato JSON de query params
  const { id_paciente } = DosisPendientesQueryDTO.from(req.query);

  const include = id_paciente
    ? [{
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
    : [];

  const dosis = await DosisProgramada.findAll({
    where: { estado: 'PENDIENTE' },
    include
  });

  // DTO de salida: verifica y da formato al JSON
  return ok(res, DosisProgramadaResponseDTO.fromList(dosis));
};

const confirmar = async (req, res) => {
  // DTO de entrada: verifica formato JSON
  const dto = ConfirmarDosisDTO.from(req.body);

  const resultado = await enTransaccion(async (transaction) => {
    const dosis = await buscarDosis(req.params.id, { transaction });

    await dosis.update({ estado: 'TOMADA' }, { transaction });

    const registro = await RegistroDosis.create({
      id_dosis_programada: dosis.id_dosis_programada,
      fecha_confirmacion: new Date(),
      observaciones: dto.observaciones
    }, { transaction });

    return { dosis, registro };
  });

  // DTO de salida: verifica JSON
  return created(res, new DosisRegistradaResponseDTO(resultado), 'Dosis confirmada');
};

const omitir = async (req, res) => {
  // DTO de entrada: verifica formato JSON
  const dto = OmitirDosisDTO.from(req.body);

  const resultado = await enTransaccion(async (transaction) => {
    const dosis = await buscarDosis(req.params.id, { conRelaciones: true, transaction });

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

  // DTO de salida: verifica JSON
  return created(res, new DosisRegistradaResponseDTO(resultado), 'Dosis registrada como omitida');
};

const generarAlerta = async (req, res) => {
  // DTO de entrada: verifica formato JSON
  const dto = GenerarAlertaDTO.from(req.body);

  const dosis = await DosisProgramada.findByPk(dto.id_dosis_programada);
  if (!dosis) throw new NotFoundError('Dosis no encontrada');

  const notificacion = await Notificacion.create({
    id_dosis_programada: dosis.id_dosis_programada,
    id_usuario_destinatario: dto.id_usuario_destinatario,
    tipo: 'RECORDATORIO',
    mensaje: `Recuerde tomar su medicamento programado para ${dosis.fecha_hora}`,
    estado: 'PENDIENTE'
  });

  // DTO de salida: verifica JSON
  return created(res, new NotificacionResponseDTO(notificacion), 'Alerta generada');
};

// ==========================================
// Endpoints definidos en el Controller
// ==========================================
router.get('/pendientes', r(listarPendientes));
router.post('/alerta', r(generarAlerta));
router.post('/:id/confirmar', validarId(), r(confirmar));
router.post('/:id/omitir', validarId(), r(omitir));

module.exports = router;
module.exports.listarPendientes = listarPendientes;
module.exports.confirmar = confirmar;
module.exports.omitir = omitir;
module.exports.generarAlerta = generarAlerta;
