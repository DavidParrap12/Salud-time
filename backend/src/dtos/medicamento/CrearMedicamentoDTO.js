const BaseDTO = require('../BaseDTO');
const { crearMedicamentoCondiciones } = require('../../validaciones');

class CrearMedicamentoDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.nombre = BaseDTO.texto(data.nombre);
    this.presentacion = BaseDTO.texto(data.presentacion) || null;
    this.descripcion = BaseDTO.texto(data.descripcion) || null;
    this.fecha_vencimiento = data.fecha_vencimiento || null;
  }

  static rules() {
    return crearMedicamentoCondiciones;
  }
}

module.exports = CrearMedicamentoDTO;
