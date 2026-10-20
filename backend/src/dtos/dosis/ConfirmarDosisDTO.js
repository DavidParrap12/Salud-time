class ConfirmarDosisDTO {
  constructor(data = {}) {
    const { observaciones } = data;
    this.observaciones = observaciones?.trim() || null;
  }

  validar() {
    return [];
  }
}

module.exports = ConfirmarDosisDTO;
