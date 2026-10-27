const BaseResponseDTO = require('../BaseResponseDTO');

class CuidadorResponseDTO extends BaseResponseDTO {
  static fields = [
    'id_cuidador_paciente',
    'id_paciente',
    'id_cuidador',
    'parentesco',
    'estado'
  ];
}

module.exports = CuidadorResponseDTO;
