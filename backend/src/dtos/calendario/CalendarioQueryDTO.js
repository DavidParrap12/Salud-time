const BaseDTO = require('../BaseDTO');
const { calendarioQueryCondiciones } = require('../../validaciones');

class CalendarioQueryDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.mes = BaseDTO.entero(data.mes);
    this.anio = BaseDTO.entero(data.anio);
  }

  static rules() {
    return calendarioQueryCondiciones;
  }
}

module.exports = CalendarioQueryDTO;
