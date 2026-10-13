class EspecializacionResponseDTO {
  constructor(esp) {
    this.id_especializacion = esp.id_especializacion;
    this.nombre             = esp.nombre;
    this.descripcion        = esp.descripcion;
  }

  static fromList(lista) {
    return lista.map(e => new EspecializacionResponseDTO(e));
  }
}

module.exports = EspecializacionResponseDTO;