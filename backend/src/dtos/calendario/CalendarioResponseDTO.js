const BaseResponseDTO = require('../BaseResponseDTO');

class CalendarioResponseDTO extends BaseResponseDTO {
  static fields = ['mes', 'anio', 'dias'];

  constructor(data = {}) {
    const dias = (data.dias || []).map((d) => ({
      fecha: d.fecha,
      tomadas: d.tomadas,
      omitidas: d.omitidas,
      total: d.total
    }));

    super({ mes: data.mes, anio: data.anio, dias });
  }
}

module.exports = CalendarioResponseDTO;
