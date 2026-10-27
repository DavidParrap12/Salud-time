const BaseResponseDTO = require('../BaseResponseDTO');

class TratamientoResponseDTO extends BaseResponseDTO {
  static fields = [
    'id_tratamiento',
    'id_paciente',
    'id_medicamento',
    'id_medico',
    'dosis',
    'fecha_inicio',
    'fecha_fin',
    'estado'
  ];
}

module.exports = TratamientoResponseDTO;
