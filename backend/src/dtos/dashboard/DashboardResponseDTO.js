const BaseResponseDTO = require('../BaseResponseDTO');

class DashboardResponseDTO extends BaseResponseDTO {
  static fields = ['usuario', 'medicamentosHoy', 'dosisPendientes', 'resumen'];

  constructor(data = {}) {
    const { usuario, medicamentosHoy = [], dosisPendientes = [], resumen = {} } = data;

    super({
      usuario,
      medicamentosHoy: medicamentosHoy || [],
      dosisPendientes: dosisPendientes || [],
      resumen: {
        total_hoy: resumen.total_hoy ?? 0,
        tomadas_hoy: resumen.tomadas_hoy ?? 0,
        pendientes_hoy: resumen.pendientes_hoy ?? 0,
        omitidas_hoy: resumen.omitidas_hoy ?? 0
      }
    });
  }
}

module.exports = DashboardResponseDTO;
