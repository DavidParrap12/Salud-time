class UsuarioResponseDTO {
  constructor(usuario) {
    this.id_usuario        = usuario.id_usuario;
    this.nombre_completo   = usuario.nombre_completo;
    this.correo            = usuario.correo;
    this.edad              = usuario.edad;
    this.telefono          = usuario.telefono;
    this.estado            = usuario.estado;
    this.correo_verificado = usuario.correo_verificado;
    this.fecha_registro    = usuario.fecha_registro;
  }

  static fromList(usuarios) {
    return usuarios.map(u => new UsuarioResponseDTO(u));
  }
}

module.exports = UsuarioResponseDTO;