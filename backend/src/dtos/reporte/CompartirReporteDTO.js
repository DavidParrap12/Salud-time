const BaseDTO = require('../BaseDTO');
const { compartirReporteCondiciones } = require('../../validaciones');

class CompartirReporteDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.id_reporte = BaseDTO.entero(data.id_reporte);
    this.correo_destino = BaseDTO.texto(data.correo_destino)?.toLowerCase();
  }

  static rules() {
    return compartirReporteCondiciones;
  }
}

module.exports = CompartirReporteDTO;
