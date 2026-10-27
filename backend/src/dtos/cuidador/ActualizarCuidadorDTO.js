const BaseDTO = require('../BaseDTO');
const {
  actualizarCuidadorCondiciones,
  actualizarCuidadorReglaCruzada
} = require('../../validaciones');

class ActualizarCuidadorDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.parentesco = BaseDTO.texto(data.parentesco);
    this.estado = data.estado;
  }

  static rules() {
    return actualizarCuidadorCondiciones;
  }

  validarReglasCruzadas() {
    return actualizarCuidadorReglaCruzada(this);
  }
}

module.exports = ActualizarCuidadorDTO;
