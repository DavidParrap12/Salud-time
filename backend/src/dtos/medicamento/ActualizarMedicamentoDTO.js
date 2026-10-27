const BaseDTO = require('../BaseDTO');
const {
  actualizarMedicamentoCondiciones,
  actualizarMedicamentoReglaCruzada
} = require('../../validaciones');

class ActualizarMedicamentoDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.nombre = BaseDTO.texto(data.nombre);
    this.presentacion = BaseDTO.texto(data.presentacion);
    this.descripcion = BaseDTO.texto(data.descripcion);
    this.fecha_vencimiento = data.fecha_vencimiento;
    this.estado = data.estado;
  }

  static rules() {
    return actualizarMedicamentoCondiciones;
  }

  validarReglasCruzadas() {
    return actualizarMedicamentoReglaCruzada(this);
  }
}

module.exports = ActualizarMedicamentoDTO;
