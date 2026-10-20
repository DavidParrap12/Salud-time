class CuidadorResponseDTO {
  constructor(relacion) {
    this.id_cuidador_paciente = relacion.id_cuidador_paciente;
    this.id_paciente          = relacion.id_paciente;
    this.id_cuidador          = relacion.id_cuidador;
    this.parentesco           = relacion.parentesco;
    this.estado               = relacion.estado;
  }

  static fromList(lista) {
    return lista.map(r => new CuidadorResponseDTO(r));
  }
}

module.exports = CuidadorResponseDTO;
