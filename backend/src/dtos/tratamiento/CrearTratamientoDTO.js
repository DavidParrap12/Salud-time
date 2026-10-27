const BaseDTO = require('../BaseDTO');
const {
  crearTratamientoCondiciones,
  crearTratamientoReglaCruzada
} = require('../../validaciones');

class CrearTratamientoDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.id_paciente = BaseDTO.entero(data.id_paciente);
    this.id_medicamento = BaseDTO.entero(data.id_medicamento);
    this.id_medico = BaseDTO.entero(data.id_medico);
    this.dosis = BaseDTO.texto(data.dosis);
    this.fecha_inicio = data.fecha_inicio || null;
    this.fecha_fin = data.fecha_fin || null;
  }

  static rules() {
    return crearTratamientoCondiciones;
  }

  validarReglasCruzadas() {
    return crearTratamientoReglaCruzada(this);
  }
}

module.exports = CrearTratamientoDTO;
