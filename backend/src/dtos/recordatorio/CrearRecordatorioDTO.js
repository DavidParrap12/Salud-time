const BaseDTO = require('../BaseDTO');
const {
  crearRecordatorioCondiciones,
  crearRecordatorioReglaCruzada
} = require('../../validaciones');

class CrearRecordatorioDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.id_tratamiento = BaseDTO.entero(data.id_tratamiento);
    this.hora = BaseDTO.texto(data.hora);
    this.dias_semana = BaseDTO.texto(data.dias_semana);
    this.fecha_inicio = data.fecha_inicio;
    this.fecha_fin = data.fecha_fin || null;
  }

  static rules() {
    return crearRecordatorioCondiciones;
  }

  validarReglasCruzadas() {
    return crearRecordatorioReglaCruzada(this);
  }
}

module.exports = CrearRecordatorioDTO;
