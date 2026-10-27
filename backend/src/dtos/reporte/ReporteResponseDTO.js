const BaseResponseDTO = require('../BaseResponseDTO');

class ReporteResponseDTO extends BaseResponseDTO {
  static fields = [
    'id_reporte',
    'id_usuario',
    'fecha_inicio',
    'fecha_fin',
    'total',
    'tomadas',
    'omitidas',
    'adherencia',
    'fecha_generacion'
  ];
}

module.exports = ReporteResponseDTO;
