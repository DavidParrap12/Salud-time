class RolResponseDTO {
  constructor(rol) {
    this.id_rol      = rol.id_rol;
    this.nombre      = rol.nombre;
    this.descripcion = rol.descripcion;
  }

  static fromList(roles) {
    return roles.map(r => new RolResponseDTO(r));
  }
}

module.exports = RolResponseDTO;