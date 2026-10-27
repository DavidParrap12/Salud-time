const BaseResponseDTO = require('../BaseResponseDTO');

class CompartirReporteResponseDTO extends BaseResponseDTO {
  static fields = ['id_reporte', 'correo_destino', 'enviado'];
}

module.exports = CompartirReporteResponseDTO;
