const BaseDTO = require('../BaseDTO');
const { cambiarDiasCondiciones } = require('../../validaciones');

class CambiarDiasDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.dias_semana = BaseDTO.texto(data.dias_semana);
  }

  static rules() {
    return cambiarDiasCondiciones;
  }
}

module.exports = CambiarDiasDTO;
