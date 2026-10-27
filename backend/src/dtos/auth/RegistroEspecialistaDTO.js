const BaseDTO = require('../BaseDTO');
const { registroEspecialistaCondiciones } = require('../../validaciones');

class RegistroEspecialistaDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.nombre_completo = BaseDTO.texto(data.nombre_completo);
    this.correo = BaseDTO.texto(data.correo)?.toLowerCase();
    this.contrasena = data.contrasena;
    this.edad = BaseDTO.entero(data.edad);
    this.telefono = BaseDTO.texto(data.telefono) || null;
    this.id_especializacion = BaseDTO.entero(data.id_especializacion);
  }

  static rules() {
    return registroEspecialistaCondiciones;
  }
}

module.exports = RegistroEspecialistaDTO;
