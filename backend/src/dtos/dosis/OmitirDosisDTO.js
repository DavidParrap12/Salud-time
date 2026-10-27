const BaseDTO = require('../BaseDTO');
const { omitirDosisCondiciones } = require('../../validaciones');

class OmitirDosisDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.motivo = BaseDTO.texto(data.motivo) || null;
  }

  static rules() {
    return omitirDosisCondiciones;
  }
}

module.exports = OmitirDosisDTO;
