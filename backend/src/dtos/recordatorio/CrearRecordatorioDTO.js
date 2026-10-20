class CrearRecordatorioDTO {
  constructor(data = {}) {
    const { id_tratamiento, hora, dias_semana, fecha_inicio, fecha_fin } = data;
    this.id_tratamiento = Number(id_tratamiento);
    this.hora           = hora?.trim();
    this.dias_semana    = dias_semana?.trim();
    this.fecha_inicio   = fecha_inicio;
    this.fecha_fin      = fecha_fin || null;
  }

  validar() {
    const errores = [];
    if (!this.id_tratamiento || isNaN(this.id_tratamiento))
      errores.push('El tratamiento es obligatorio');
    if (!this.hora || !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(this.hora))
      errores.push('La hora no tiene un formato válido (HH:MM)');
    if (!this.dias_semana)
      errores.push('Los días de la semana son obligatorios');
    if (!this.fecha_inicio)
      errores.push('La fecha de inicio es obligatoria');
    if (this.fecha_inicio && this.fecha_fin && new Date(this.fecha_fin) < new Date(this.fecha_inicio))
      errores.push('La fecha de fin no puede ser anterior a la de inicio');
    return errores;
  }
}

module.exports = CrearRecordatorioDTO;
