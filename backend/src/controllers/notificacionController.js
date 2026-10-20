const { Notificacion } = require('../models');
const CrearNotificacionDTO      = require('../dtos/notificacion/CrearNotificacionDTO');
const NotificacionResponseDTO   = require('../dtos/notificacion/NotificacionResponseDTO');
const { ok, created, error }    = require('../views/response');

exports.listarPorUsuario = async (req, res) => {
  try {
    const lista = await Notificacion.findAll({
      where: { id_usuario_destinatario: req.params.id_usuario }
    });
    return ok(res, NotificacionResponseDTO.fromList(lista));
  } catch (e) {
    return error(res, 500, 'Error al listar notificaciones', e.message);
  }
};

exports.crear = async (req, res) => {
  try {
    const dto = new CrearNotificacionDTO(req.body || {});
    const errores = dto.validar();
    if (errores.length) return error(res, 400, 'Datos inválidos', errores);

    const notif = await Notificacion.create({
      id_dosis_programada: dto.id_dosis_programada,
      id_usuario_destinatario: dto.id_usuario_destinatario,
      tipo: dto.tipo,
      mensaje: dto.mensaje,
      estado: 'PENDIENTE'
    });

    return created(res, new NotificacionResponseDTO(notif), 'Notificación creada');
  } catch (e) {
    return error(res, 500, 'Error al crear notificación', e.message);
  }
};

exports.marcarLeida = async (req, res) => {
  try {
    const notif = await Notificacion.findByPk(req.params.id);
    if (!notif) return error(res, 404, 'Notificación no encontrada');
    await notif.update({ estado: 'LEIDA' });
    return ok(res, new NotificacionResponseDTO(notif), 'Notificación marcada como leída');
  } catch (e) {
    return error(res, 500, 'Error al marcar notificación', e.message);
  }
};