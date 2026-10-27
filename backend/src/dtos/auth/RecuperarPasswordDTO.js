const BaseDTO = require('../BaseDTO');
const { recuperarPasswordCondiciones } = require('../../validaciones');

class RecuperarPasswordDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.correo = BaseDTO.texto(data.correo)?.toLowerCase();
  }

  static rules() {
    return recuperarPasswordCondiciones;
  }
}

module.exports = RecuperarPasswordDTO;
