class OmitirDosisDTO {
  constructor(data = {}) {
    const { motivo } = data;
    this.motivo = motivo?.trim() || null;
  }

  validar() {
    const errores = [];
    if (this.motivo && this.motivo.length > 255)
      errores.push('El motivo no puede superar 255 caracteres');
    return errores;
  }
}

module.exports = OmitirDosisDTO;
