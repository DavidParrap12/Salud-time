const BaseDTO = require('../BaseDTO');
const {
  actualizarUsuarioCondiciones,
  actualizarUsuarioReglaCruzada
} = require('../../validaciones');

class ActualizarUsuarioDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.nombre_completo = BaseDTO.texto(data.nombre_completo);
    this.telefono = BaseDTO.texto(data.telefono);
    this.edad = BaseDTO.entero(data.edad);
  }

  static rules() {
    return actualizarUsuarioCondiciones;
  }

  validarReglasCruzadas() {
    return actualizarUsuarioReglaCruzada(this);
  }
}

module.exports = ActualizarUsuarioDTO;
