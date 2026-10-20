class ActualizarRecordatorioDTO {
  constructor(data = {}) {
    const { hora, dias_semana, fecha_inicio, fecha_fin, estado } = data;
    this.hora         = hora?.trim();
    this.dias_semana  = dias_semana?.trim();
    this.fecha_inicio = fecha_inicio;
    this.fecha_fin    = fecha_fin;
    this.estado       = estado;
  }

  validar() {
    const errores = [];
    if (this.hora !== undefined && !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(this.hora))
      errores.push('La hora no tiene un formato válido (HH:MM)');
    if (this.dias_semana !== undefined && !this.dias_semana)
      errores.push('Los días de la semana no pueden estar vacíos');
    if (this.estado !== undefined && typeof this.estado !== 'boolean')
      errores.push('El estado debe ser booleano');
    if (this.fecha_inicio && this.fecha_fin && new Date(this.fecha_fin) < new Date(this.fecha_inicio))
      errores.push('La fecha de fin no puede ser anterior a la de inicio');
    return errores;
  }
}

module.exports = ActualizarRecordatorioDTO;
