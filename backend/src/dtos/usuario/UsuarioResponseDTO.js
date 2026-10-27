const BaseResponseDTO = require('../BaseResponseDTO');

class UsuarioResponseDTO extends BaseResponseDTO {
  static fields = [
    'id_usuario',
    'nombre_completo',
    'correo',
    'edad',
    'telefono',
    'estado',
    'correo_verificado',
    'fecha_registro'
  ];
}

module.exports = UsuarioResponseDTO;
