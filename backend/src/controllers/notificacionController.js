const { Router } = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validarId = require('../middlewares/validarId');
const { Notificacion } = require('../models');
const CrearNotificacionDTO = require('../dtos/notificacion/CrearNotificacionDTO');
const NotificacionResponseDTO = require('../dtos/notificacion/NotificacionResponseDTO');
const { ok, created } = require('../views/response');
const { NotFoundError } = require('../errors/AppError');

const router = Router();
const r = (handler) => asyncHandler(handler);

// ==========================================
// Orquestación y validación HTTP
// ==========================================

const listarPorUsuario = async (req, res) => {
  const lista = await Notificacion.findAll({
    where: { id_usuario_destinatario: req.params.id_usuario }
  });
  return ok(res, NotificacionResponseDTO.fromList(lista));
};

const crear = async (req, res) => {
  // DTO de entrada: verifica formato JSON
  const dto = CrearNotificacionDTO.from(req.body);

  const notificacion = await Notificacion.create({
    id_dosis_programada: dto.id_dosis_programada,
    id_usuario_destinatario: dto.id_usuario_destinatario,
    tipo: dto.tipo,
    mensaje: dto.mensaje,
    estado: 'PENDIENTE'
  });

  // DTO de salida: verifica y limpia JSON
  return created(res, new NotificacionResponseDTO(notificacion), 'Notificación creada');
};

const marcarLeida = async (req, res) => {
  const notificacion = await Notificacion.findByPk(req.params.id);
  if (!notificacion) throw new NotFoundError('Notificación no encontrada');

  await notificacion.update({ estado: 'LEIDA' });
  return ok(res, new NotificacionResponseDTO(notificacion), 'Notificación marcada como leída');
};

// ==========================================
// Endpoints definidos en el Controller
// ==========================================
router.get('/usuario/:id_usuario', validarId('id_usuario'), r(listarPorUsuario));
router.post('/', r(crear));
router.patch('/:id/leida', validarId(), r(marcarLeida));

module.exports = router;
module.exports.listarPorUsuario = listarPorUsuario;
module.exports.crear = crear;
module.exports.marcarLeida = marcarLeida;
