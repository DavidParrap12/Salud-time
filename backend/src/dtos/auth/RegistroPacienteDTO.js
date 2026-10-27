const BaseDTO = require('../BaseDTO');
const { registroPacienteCondiciones } = require('../../validaciones');

class RegistroPacienteDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.nombre_completo = BaseDTO.texto(data.nombre_completo);
    this.correo = BaseDTO.texto(data.correo)?.toLowerCase();
    this.contrasena = data.contrasena;
    this.edad = BaseDTO.entero(data.edad);
    this.telefono = BaseDTO.texto(data.telefono) || null;
    this.certificado_medico = data.certificado_medico || null;
  }

  static rules() {
    return registroPacienteCondiciones;
  }
}

module.exports = RegistroPacienteDTO;
