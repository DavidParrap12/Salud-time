class ReporteResponseDTO {
  constructor(data = {}) {
    const { id_usuario, fecha_inicio, fecha_fin, total, tomadas, omitidas, adherencia } = data;
    this.id_usuario   = id_usuario;
    this.fecha_inicio = fecha_inicio;
    this.fecha_fin    = fecha_fin;
    this.total        = total;
    this.tomadas      = tomadas;
    this.omitidas     = omitidas;
    this.adherencia   = adherencia;
  }
}

module.exports = ReporteResponseDTO;
