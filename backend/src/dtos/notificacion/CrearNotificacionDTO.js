const BaseDTO = require('../BaseDTO');
const { crearNotificacionCondiciones } = require('../../validaciones');

class CrearNotificacionDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.id_dosis_programada = BaseDTO.entero(data.id_dosis_programada);
    this.id_usuario_destinatario = BaseDTO.entero(data.id_usuario_destinatario);
    this.tipo = BaseDTO.texto(data.tipo);
    this.mensaje = BaseDTO.texto(data.mensaje);
  }

  static rules() {
    return crearNotificacionCondiciones;
  }
}

module.exports = CrearNotificacionDTO;
