class NotificacionResponseDTO {
  constructor(n) {
    this.id_notificacion         = n.id_notificacion;
    this.id_dosis_programada     = n.id_dosis_programada;
    this.id_usuario_destinatario = n.id_usuario_destinatario;
    this.tipo                    = n.tipo;
    this.mensaje                 = n.mensaje;
    this.fecha_envio             = n.fecha_envio;
    this.estado                  = n.estado;
  }

  static fromList(lista) {
    return lista.map(n => new NotificacionResponseDTO(n));
  }
}

module.exports = NotificacionResponseDTO;
