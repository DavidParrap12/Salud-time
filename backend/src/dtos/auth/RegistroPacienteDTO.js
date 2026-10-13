class RegistroPacienteDTO {
  constructor({ nombre_completo, correo, contrasena, edad, telefono, certificado_medico }) {
    this.nombre_completo   = nombre_completo?.trim();
    this.correo            = correo?.trim().toLowerCase();
    this.contrasena        = contrasena;
    this.edad              = Number(edad);
    this.telefono          = telefono?.trim() || null;
    this.certificado_medico = certificado_medico || null;
  }

  validar() {
    const errores = [];
    if (!this.nombre_completo || this.nombre_completo.length < 3)
      errores.push('El nombre completo es obligatorio (mínimo 3 caracteres)');
    if (!this.correo || !/^[\w.-]+@[\w.-]+\.\w+$/.test(this.correo))
      errores.push('El correo no tiene un formato válido');
    if (!this.contrasena || this.contrasena.length < 8)
      errores.push('La contraseña debe tener al menos 8 caracteres');
    if (isNaN(this.edad) || this.edad < 0 || this.edad > 120)
      errores.push('La edad debe estar entre 0 y 120');
    return errores;
  }
}

module.exports = RegistroPacienteDTO;