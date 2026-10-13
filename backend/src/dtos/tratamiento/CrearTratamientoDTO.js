class CrearTratamientoDTO {
  constructor({ id_paciente, id_medicamento, id_medico, dosis, fecha_inicio, fecha_fin }) {
    this.id_paciente    = Number(id_paciente);
    this.id_medicamento = Number(id_medicamento);
    this.id_medico      = id_medico ? Number(id_medico) : null;
    this.dosis          = dosis?.trim();
    this.fecha_inicio   = fecha_inicio || null;
    this.fecha_fin      = fecha_fin    || null;
  }

  validar() {
    const errores = [];
    if (!this.id_paciente || isNaN(this.id_paciente))
      errores.push('El paciente es obligatorio');
    if (!this.id_medicamento || isNaN(this.id_medicamento))
      errores.push('El medicamento es obligatorio');
    if (!this.dosis)
      errores.push('La dosis es obligatoria');
    if (this.fecha_inicio && this.fecha_fin && new Date(this.fecha_fin) < new Date(this.fecha_inicio))
      errores.push('La fecha de fin no puede ser anterior a la de inicio');
    return errores;
  }
}

module.exports = CrearTratamientoDTO;