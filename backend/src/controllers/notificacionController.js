// TODO: Crear el modelo ../models/notificacion.js para que este controller funcione
const Notificacion = require('../models/Notificacion');

// DTOs
const CrearNotificacionDTO = require('../dtos/notificacion/CrearNotificacionDTO');
const NotificacionResponseDTO = require('../dtos/notificacion/NotificacionResponseDTO');

// ──────────────────────────────────────────────
// Crear notificación
// ──────────────────────────────────────────────
const crear = async (req, res) => {
  try {
    const dto = new CrearNotificacionDTO(req.body);
    const errores = dto.validar();
    if (errores.length) {
      return res.status(400).json({ ok: false, errores });
    }

    const notificacion = await Notificacion.create({
      id_dosis_programada: dto.id_dosis_programada,
      id_usuario_destinatario: dto.id_usuario_destinatario,
      tipo: dto.tipo,
      mensaje: dto.mensaje
    });

    return res.status(201).json({
      ok: true,
      mensaje: 'Notificación creada exitosamente',
      data: new NotificacionResponseDTO(notificacion)
    });
  } catch (error) {
    console.error('Error en crear notificación:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// Obtener notificaciones por usuario
// ──────────────────────────────────────────────
const obtenerPorUsuario = async (req, res) => {
  try {
    const notificaciones = await Notificacion.findAll({
      where: { id_usuario_destinatario: req.params.id_usuario },
      order: [['fecha_envio', 'DESC']]
    });

    return res.status(200).json({
      ok: true,
      data: NotificacionResponseDTO.fromList(notificaciones)
    });
  } catch (error) {
    console.error('Error en obtenerPorUsuario notificaciones:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// Marcar notificación como leída
// ──────────────────────────────────────────────
const marcarLeida = async (req, res) => {
  try {
    const notificacion = await Notificacion.findByPk(req.params.id);
    if (!notificacion) {
      return res.status(404).json({ ok: false, mensaje: 'Notificación no encontrada' });
    }

    await notificacion.update({ estado: 'LEIDA' });

    return res.status(200).json({
      ok: true,
      mensaje: 'Notificación marcada como leída',
      data: new NotificacionResponseDTO(notificacion)
    });
  } catch (error) {
    console.error('Error en marcarLeida:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

module.exports = {
  crear,
  obtenerPorUsuario,
  marcarLeida
};
