const BaseResponseDTO = require('../BaseResponseDTO');

class RecordatorioResponseDTO extends BaseResponseDTO {
  static fields = [
    'id_recordatorio',
    'id_tratamiento',
    'hora',
    'dias_semana',
    'fecha_inicio',
    'fecha_fin',
    'estado'
  ];
}

module.exports = RecordatorioResponseDTO;
