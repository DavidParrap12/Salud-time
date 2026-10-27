const BaseDTO = require('../BaseDTO');
const { confirmarDosisCondiciones } = require('../../validaciones');

class ConfirmarDosisDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.observaciones = BaseDTO.texto(data.observaciones) || null;
  }

  static rules() {
    return confirmarDosisCondiciones;
  }
}

module.exports = ConfirmarDosisDTO;
