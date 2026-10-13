class CrearNotificacionDTO {
  constructor({ id_dosis_programada, id_usuario_destinatario, tipo, mensaje }) {
    this.id_dosis_programada     = Number(id_dosis_programada);
    this.id_usuario_destinatario = Number(id_usuario_destinatario);
    this.tipo                    = tipo?.trim();
    this.mensaje                 = mensaje?.trim();
  }

  validar() {
    const errores = [];
    if (!this.id_dosis_programada || isNaN(this.id_dosis_programada))
      errores.push('La dosis programada es obligatoria');
    if (!this.id_usuario_destinatario || isNaN(this.id_usuario_destinatario))
      errores.push('El destinatario es obligatorio');
    if (!this.tipo)
      errores.push('El tipo de notificación es obligatorio');
    if (!this.mensaje)
      errores.push('El mensaje es obligatorio');
    return errores;
  }
}

module.exports = CrearNotificacionDTO;