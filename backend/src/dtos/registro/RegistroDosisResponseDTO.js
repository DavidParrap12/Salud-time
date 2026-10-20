class RegistroDosisResponseDTO {
  constructor(registro) {
    this.id_registro_dosis   = registro.id_registro_dosis;
    this.id_dosis_programada = registro.id_dosis_programada;
    this.fecha_confirmacion  = registro.fecha_confirmacion;
    this.observaciones       = registro.observaciones;
  }

  static fromList(lista) {
    return lista.map(r => new RegistroDosisResponseDTO(r));
  }
}

module.exports = RegistroDosisResponseDTO;
