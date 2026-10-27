const BaseDTO = require('../BaseDTO');
const { registrosQueryCondiciones } = require('../../validaciones');

class RegistrosQueryDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.id_paciente = BaseDTO.entero(data.id_paciente);
  }

  static rules() {
    return registrosQueryCondiciones;
  }
}

module.exports = RegistrosQueryDTO;
