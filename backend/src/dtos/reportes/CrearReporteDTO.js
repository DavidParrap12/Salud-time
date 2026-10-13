class CrearReporteDTO {
  constructor({ id_usuario, fecha_inicio, fecha_fin }) {
    this.id_usuario   = Number(id_usuario);
    this.fecha_inicio = fecha_inicio;
    this.fecha_fin    = fecha_fin;
  }

  validar() {
    const errores = [];
    if (!this.id_usuario || isNaN(this.id_usuario))
      errores.push('El usuario es obligatorio');
    if (!this.fecha_inicio || !this.fecha_fin)
      errores.push('El rango de fechas es obligatorio');
    if (this.fecha_inicio && this.fecha_fin && new Date(this.fecha_fin) < new Date(this.fecha_inicio))
      errores.push('La fecha fin no puede ser anterior a la fecha inicio');
    return errores;
  }
}

module.exports = CrearReporteDTO;