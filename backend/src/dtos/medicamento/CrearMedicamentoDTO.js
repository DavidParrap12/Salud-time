class CrearMedicamentoDTO {
  constructor(data = {}) {
    const { nombre, presentacion, descripcion, fecha_vencimiento } = data;
    this.nombre            = nombre?.trim();
    this.presentacion      = presentacion?.trim() || null;
    this.descripcion       = descripcion?.trim() || null;
    this.fecha_vencimiento = fecha_vencimiento || null;
  }

  validar() {
    const errores = [];
    if (!this.nombre || this.nombre.length < 2)
      errores.push('El nombre del medicamento es obligatorio');
    if (this.fecha_vencimiento && isNaN(Date.parse(this.fecha_vencimiento)))
      errores.push('La fecha de vencimiento no tiene un formato válido');
    return errores;
  }
}

module.exports = CrearMedicamentoDTO;
