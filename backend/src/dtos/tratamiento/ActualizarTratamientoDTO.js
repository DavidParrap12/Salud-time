const BaseDTO = require('../BaseDTO');
const {
  actualizarTratamientoCondiciones,
  actualizarTratamientoReglaCruzada
} = require('../../validaciones');

class ActualizarTratamientoDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.dosis = BaseDTO.texto(data.dosis);
    this.fecha_inicio = data.fecha_inicio;
    this.fecha_fin = data.fecha_fin;
    this.estado = data.estado;
  }

  static rules() {
    return actualizarTratamientoCondiciones;
  }

  validarReglasCruzadas() {
    return actualizarTratamientoReglaCruzada(this);
  }
}

module.exports = ActualizarTratamientoDTO;
