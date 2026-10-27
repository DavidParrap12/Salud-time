const BaseResponseDTO = require('../BaseResponseDTO');

class NotificacionResponseDTO extends BaseResponseDTO {
  static fields = [
    'id_notificacion',
    'id_dosis_programada',
    'id_usuario_destinatario',
    'tipo',
    'mensaje',
    'fecha_envio',
    'estado'
  ];
}

module.exports = NotificacionResponseDTO;
