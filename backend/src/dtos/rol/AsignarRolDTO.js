class AsignarRolDTO {
  constructor({ id_rol, id_especializacion }) {
    this.id_rol             = Number(id_rol);
    this.id_especializacion = id_especializacion ? Number(id_especializacion) : null;
  }

  validar() {
    const errores = [];
    if (!this.id_rol || isNaN(this.id_rol)) errores.push('El id_rol es obligatorio');
    return errores;
  }
}

module.exports = AsignarRolDTO;