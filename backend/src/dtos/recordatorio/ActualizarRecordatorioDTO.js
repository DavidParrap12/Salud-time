const BaseDTO = require('../BaseDTO');
const {
  actualizarRecordatorioCondiciones,
  actualizarRecordatorioReglaCruzada
} = require('../../validaciones');

class ActualizarRecordatorioDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.hora = BaseDTO.texto(data.hora);
    this.dias_semana = BaseDTO.texto(data.dias_semana);
    this.fecha_inicio = data.fecha_inicio;
    this.fecha_fin = data.fecha_fin;
    this.estado = data.estado;
  }

  static rules() {
    return actualizarRecordatorioCondiciones;
  }

  validarReglasCruzadas() {
    return actualizarRecordatorioReglaCruzada(this);
  }
}

module.exports = ActualizarRecordatorioDTO;
