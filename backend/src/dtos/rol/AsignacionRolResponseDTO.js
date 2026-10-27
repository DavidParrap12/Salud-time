const BaseResponseDTO = require('../BaseResponseDTO');

class AsignacionRolResponseDTO extends BaseResponseDTO {
  static fields = [
    'id_usuario_rol',
    'id_usuario',
    'id_rol',
    'id_especializacion',
    'fecha_asignacion'
  ];
}

module.exports = AsignacionRolResponseDTO;
