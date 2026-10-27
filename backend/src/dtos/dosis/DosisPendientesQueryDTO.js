const BaseDTO = require('../BaseDTO');
const { dosisPendientesQueryCondiciones } = require('../../validaciones');

class DosisPendientesQueryDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.id_paciente = BaseDTO.entero(data.id_paciente);
  }

  static rules() {
    return dosisPendientesQueryCondiciones;
  }
}

module.exports = DosisPendientesQueryDTO;
