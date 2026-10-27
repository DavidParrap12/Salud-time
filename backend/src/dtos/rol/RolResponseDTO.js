const BaseResponseDTO = require('../BaseResponseDTO');

class RolResponseDTO extends BaseResponseDTO {
  static fields = ['id_rol', 'nombre', 'descripcion'];
}

module.exports = RolResponseDTO;
