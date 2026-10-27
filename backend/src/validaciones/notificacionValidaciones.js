/**
 * Condiciones y reglas de validación para los endpoints de Notificaciones.
 */
const crearNotificacionCondiciones = {
  id_dosis_programada: {
    required: true,
    type: 'int',
    min: 1,
    message: 'La dosis programada es obligatoria'
  },
  id_usuario_destinatario: {
    required: true,
    type: 'int',
    min: 1,
    message: 'El destinatario es obligatorio'
  },
  tipo: {
    required: true,
    type: 'string',
    max: 50,
    message: 'El tipo de notificación es obligatorio (máximo 50 caracteres)'
  },
  mensaje: {
    required: true,
    type: 'string',
    max: 255,
    message: 'El mensaje es obligatorio (máximo 255 caracteres)'
  }
};

module.exports = {
  crearNotificacionCondiciones
};
