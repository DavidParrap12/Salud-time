const BaseResponseDTO = require('../BaseResponseDTO');

class ReporteEstadisticasResponseDTO extends BaseResponseDTO {
  static fields = ['reporte', 'pendientes', 'porcentaje_tomadas', 'porcentaje_omitidas'];
}

module.exports = ReporteEstadisticasResponseDTO;
