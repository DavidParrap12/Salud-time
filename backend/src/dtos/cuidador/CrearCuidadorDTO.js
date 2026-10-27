const BaseDTO = require('../BaseDTO');
const { crearCuidadorCondiciones } = require('../../validaciones');

class CrearCuidadorDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.id_paciente = BaseDTO.entero(data.id_paciente);
    this.correo_cuidador = BaseDTO.texto(data.correo_cuidador)?.toLowerCase();
    this.parentesco = BaseDTO.texto(data.parentesco) || null;
  }

  static rules() {
    return crearCuidadorCondiciones;
  }
}

module.exports = CrearCuidadorDTO;
