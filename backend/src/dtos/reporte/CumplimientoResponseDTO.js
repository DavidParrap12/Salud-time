const BaseResponseDTO = require('../BaseResponseDTO');

class CumplimientoResponseDTO extends BaseResponseDTO {
  static fields = ['id_reporte', 'adherencia', 'nivel', 'mensaje'];
}

module.exports = CumplimientoResponseDTO;
