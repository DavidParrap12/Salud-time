class DashboardResponseDTO {
  constructor({ usuario, medicamentosHoy, dosisPendientes, resumen }) {
    this.usuario           = usuario;
    this.medicamentosHoy   = medicamentosHoy;
    this.dosisPendientes   = dosisPendientes;
    this.resumen           = {
      total_hoy:      resumen?.total_hoy      || 0,
      tomadas_hoy:    resumen?.tomadas_hoy    || 0,
      pendientes_hoy: resumen?.pendientes_hoy || 0,
      omitidas_hoy:   resumen?.omitidas_hoy   || 0
    };
  }
}

module.exports = DashboardResponseDTO;