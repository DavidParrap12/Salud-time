const BaseDTO = require('../BaseDTO');
const {
  crearReporteCondiciones,
  crearReporteReglaCruzada
} = require('../../validaciones');

class CrearReporteDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.id_usuario = BaseDTO.entero(data.id_usuario);
    this.fecha_inicio = data.fecha_inicio;
    this.fecha_fin = data.fecha_fin;
  }

  static rules() {
    return crearReporteCondiciones;
  }

  validarReglasCruzadas() {
    return crearReporteReglaCruzada(this);
  }
}

module.exports = CrearReporteDTO;
