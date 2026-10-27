const BaseDTO = require('../BaseDTO');
const { asignarRolCondiciones } = require('../../validaciones');

class AsignarRolDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.id_rol = BaseDTO.entero(data.id_rol);
    this.id_especializacion = BaseDTO.entero(data.id_especializacion);
  }

  static rules() {
    return asignarRolCondiciones;
  }
}

module.exports = AsignarRolDTO;
