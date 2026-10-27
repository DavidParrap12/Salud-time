const BaseResponseDTO = require('../BaseResponseDTO');

class EspecializacionResponseDTO extends BaseResponseDTO {
  static fields = ['id_especializacion', 'nombre', 'descripcion'];
}

module.exports = EspecializacionResponseDTO;
