const BaseDTO = require('../BaseDTO');
const { cambiarHoraCondiciones } = require('../../validaciones');

class CambiarHoraDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.hora = BaseDTO.texto(data.hora);
  }

  static rules() {
    return cambiarHoraCondiciones;
  }
}

module.exports = CambiarHoraDTO;
