const BaseDTO = require('../BaseDTO');
const { loginCondiciones } = require('../../validaciones');

class LoginDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.correo = BaseDTO.texto(data.correo)?.toLowerCase();
    this.contrasena = data.contrasena;
  }

  static rules() {
    return loginCondiciones;
  }
}

module.exports = LoginDTO;
