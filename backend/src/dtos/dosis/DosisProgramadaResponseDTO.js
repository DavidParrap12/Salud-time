class DosisProgramadaResponseDTO {
  constructor(dosis) {
    this.id_dosis_programada = dosis.id_dosis_programada;
    this.id_recordatorio     = dosis.id_recordatorio;
    this.fecha_hora          = dosis.fecha_hora;
    this.estado              = dosis.estado;
  }

  static fromList(lista) {
    return lista.map(d => new DosisProgramadaResponseDTO(d));
  }
}

module.exports = DosisProgramadaResponseDTO;
