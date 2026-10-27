const BaseDTO = require('../BaseDTO');
const { calendarioFechaQueryCondiciones } = require('../../validaciones');

class CalendarioFechaQueryDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.fecha = data.fecha;
  }

  static rules() {
    return calendarioFechaQueryCondiciones;
  }
}

module.exports = CalendarioFechaQueryDTO;
