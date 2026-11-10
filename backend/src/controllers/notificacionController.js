const { Router } = require('express');
const endpoint = require('../http/endpoint');
const validarId = require('../middlewares/validarId');
const { Notificacion } = require('../models');
const CrearNotificacionDTO = require('../dtos/notificacion/CrearNotificacionDTO');
const NotificacionResponseDTO = require('../dtos/notificacion/NotificacionResponseDTO');
const { ok, created } = require('../views/response');
const { NotFoundError } = require('../errors/AppError');

const router = Router();

// ==========================================
// Orquestación de los casos de uso
// ==========================================

const listarPorUsuario = async ({ params }) => {
  const lista = await Notificacion.findAll({
    where: { id_usuario_destinatario: params.id_usuario }
  });
  return ok(NotificacionResponseDTO.fromList(lista));
};

const crear = async ({ body: dto }) => {
  const notificacion = await Notificacion.create({
    id_dosis_programada: dto.id_dosis_programada,
    id_usuario_destinatario: dto.id_usuario_destinatario,
    tipo: dto.tipo,
    mensaje: dto.mensaje,
    estado: 'PENDIENTE'
  });

  return created(new NotificacionResponseDTO(notificacion), 'Notificación creada');
};

const marcarLeida = async ({ params }) => {
  const notificacion = await Notificacion.findByPk(params.id);
  if (!notificacion) throw new NotFoundError('Notificación no encontrada');

  await notificacion.update({ estado: 'LEIDA' });
  return ok(new NotificacionResponseDTO(notificacion), 'Notificación marcada como leída');
};

// ==========================================
// Endpoints definidos en el Controller
// ==========================================
router.get('/usuario/:id_usuario', validarId('id_usuario'), endpoint(listarPorUsuario));
router.post('/', endpoint(crear, { body: CrearNotificacionDTO }));
router.patch('/:id/leida', validarId(), endpoint(marcarLeida));

module.exports = router;
module.exports.listarPorUsuario = listarPorUsuario;
module.exports.crear = crear;
module.exports.marcarLeida = marcarLeida;
