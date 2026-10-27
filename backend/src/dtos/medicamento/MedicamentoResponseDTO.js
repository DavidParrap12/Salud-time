const BaseResponseDTO = require('../BaseResponseDTO');

class MedicamentoResponseDTO extends BaseResponseDTO {
  static fields = [
    'id_medicamento',
    'nombre',
    'presentacion',
    'descripcion',
    'fecha_vencimiento',
    'estado'
  ];
}

module.exports = MedicamentoResponseDTO;
