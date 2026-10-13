class ActualizarUsuarioDTO {
  constructor({ nombre_completo, telefono, edad }) {
    this.nombre_completo = nombre_completo?.trim();
    this.telefono        = telefono?.trim();
    this.edad            = edad !== undefined ? Number(edad) : undefined;
  }

  validar() {
    const errores = [];
    if (this.nombre_completo && this.nombre_completo.length < 3)
      errores.push('El nombre debe tener al menos 3 caracteres');
    if (this.edad !== undefined && (isNaN(this.edad) || this.edad < 0 || this.edad > 120))
      errores.push('La edad debe estar entre 0 y 120');
    return errores;
  }
}

module.exports = ActualizarUsuarioDTO;