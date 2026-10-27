const BaseDTO = require('../BaseDTO');
const { idParamCondiciones } = require('../../validaciones');

class IdParamDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.id = BaseDTO.entero(data.id);
  }

  static rules() {
    return idParamCondiciones;
  }
}

module.exports = IdParamDTO;
