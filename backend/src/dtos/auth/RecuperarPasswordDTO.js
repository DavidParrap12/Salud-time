class RecuperarPasswordDTO {
  constructor({ correo }) {
    this.correo = correo?.trim().toLowerCase();
  }

  validar() {
    const errores = [];
    if (!this.correo || !/^[\w.-]+@[\w.-]+\.\w+$/.test(this.correo))
      errores.push('El correo no tiene un formato válido');
    return errores;
  }
}

module.exports = RecuperarPasswordDTO;