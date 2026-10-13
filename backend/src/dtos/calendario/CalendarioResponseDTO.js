class CalendarioResponseDTO {
  constructor({ mes, anio, dias }) {
    this.mes  = mes;
    this.anio = anio;
    this.dias = dias.map(d => ({
      fecha:    d.fecha,
      tomadas:  d.tomadas,
      omitidas: d.omitidas,
      total:    d.total
    }));
  }
}

module.exports = CalendarioResponseDTO;