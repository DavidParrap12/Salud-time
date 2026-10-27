const BaseDTO = require('../BaseDTO');
const { generarAlertaCondiciones } = require('../../validaciones');

class GenerarAlertaDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.id_dosis_programada = BaseDTO.entero(data.id_dosis_programada);
    this.id_usuario_destinatario = BaseDTO.entero(data.id_usuario_destinatario);
  }

  static rules() {
    return generarAlertaCondiciones;
  }
}

module.exports = GenerarAlertaDTO;
