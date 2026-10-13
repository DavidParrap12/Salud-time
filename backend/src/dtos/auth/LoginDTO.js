class LoginDTO {
  constructor({ correo, contrasena }) {
    this.correo     = correo?.trim().toLowerCase();
    this.contrasena = contrasena;
  }

  validar() {
    const errores = [];
    if (!this.correo)     errores.push('El correo es obligatorio');
    if (!this.contrasena) errores.push('La contraseña es obligatoria');
    return errores;
  }
}

module.exports = LoginDTO;