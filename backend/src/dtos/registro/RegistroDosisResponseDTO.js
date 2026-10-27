const BaseResponseDTO = require('../BaseResponseDTO');

class RegistroDosisResponseDTO extends BaseResponseDTO {
  static fields = [
    'id_registro_dosis',
    'id_dosis_programada',
    'fecha_confirmacion',
    'observaciones'
  ];
}

module.exports = RegistroDosisResponseDTO;
