const BaseResponseDTO = require('../BaseResponseDTO');

class DosisProgramadaResponseDTO extends BaseResponseDTO {
  static fields = [
    'id_dosis_programada',
    'id_recordatorio',
    'fecha_hora',
    'estado'
  ];
}

module.exports = DosisProgramadaResponseDTO;
