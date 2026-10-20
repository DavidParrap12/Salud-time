class ActualizarMedicamentoDTO {
  constructor(data = {}) {
    const { nombre, presentacion, descripcion, fecha_vencimiento, estado } = data;
    this.nombre            = nombre?.trim();
    this.presentacion      = presentacion?.trim();
    this.descripcion       = descripcion?.trim();
    this.fecha_vencimiento = fecha_vencimiento;
    this.estado            = estado;
  }

  validar() {
    const errores = [];
    if (this.nombre !== undefined && this.nombre.length < 2)
      errores.push('El nombre es demasiado corto');
    if (this.fecha_vencimiento !== undefined && this.fecha_vencimiento && isNaN(Date.parse(this.fecha_vencimiento)))
      errores.push('La fecha de vencimiento no tiene un formato válido');
    if (this.estado !== undefined && typeof this.estado !== 'boolean')
      errores.push('El estado debe ser booleano');
    return errores;
  }
}

module.exports = ActualizarMedicamentoDTO;
