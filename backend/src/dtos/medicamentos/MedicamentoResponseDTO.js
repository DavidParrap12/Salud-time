class MedicamentoResponseDTO {
  constructor(m) {
    this.id_medicamento = m.id_medicamento;
    this.nombre         = m.nombre;
    this.presentacion   = m.presentacion;
    this.descripcion    = m.descripcion;
    this.estado         = m.estado;
  }

  static fromList(lista) {
    return lista.map(m => new MedicamentoResponseDTO(m));
  }
}

module.exports = MedicamentoResponseDTO;