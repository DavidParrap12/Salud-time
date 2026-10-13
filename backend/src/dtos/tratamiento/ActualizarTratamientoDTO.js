class ActualizarTratamientoDTO {
  constructor({ dosis, fecha_inicio, fecha_fin, estado }) {
    this.dosis        = dosis?.trim();
    this.fecha_inicio = fecha_inicio;
    this.fecha_fin    = fecha_fin;
    this.estado       = estado;
  }

  validar() {
    const errores = [];
    if (this.dosis !== undefined && !this.dosis)
      errores.push('La dosis no puede estar vacía');
    if (this.estado !== undefined && typeof this.estado !== 'boolean')
      errores.push('El estado debe ser booleano');
    return errores;
  }
}

module.exports = ActualizarTratamientoDTO;