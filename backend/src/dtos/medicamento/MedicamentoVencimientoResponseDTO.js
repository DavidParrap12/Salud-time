const BaseResponseDTO = require('../BaseResponseDTO');

class MedicamentoVencimientoResponseDTO extends BaseResponseDTO {
  static fields = ['id_medicamento', 'nombre', 'fecha_vencimiento'];
}

module.exports = MedicamentoVencimientoResponseDTO;
