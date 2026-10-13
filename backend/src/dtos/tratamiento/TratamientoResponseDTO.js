class TratamientoResponseDTO {
  constructor(t) {
    this.id_tratamiento = t.id_tratamiento;
    this.id_paciente    = t.id_paciente;
    this.id_medicamento = t.id_medicamento;
    this.id_medico      = t.id_medico;
    this.dosis          = t.dosis;
    this.fecha_inicio   = t.fecha_inicio;
    this.fecha_fin      = t.fecha_fin;
    this.estado         = t.estado;
  }

  static fromList(lista) {
    return lista.map(t => new TratamientoResponseDTO(t));
  }
}

module.exports = TratamientoResponseDTO;