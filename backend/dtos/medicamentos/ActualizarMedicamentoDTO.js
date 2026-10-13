class ActualizarMedicamentoDTO {
  constructor({ nombre, presentacion, descripcion, estado }) {
    this.nombre       = nombre?.trim();
    this.presentacion = presentacion?.trim();
    this.descripcion  = descripcion?.trim();
    this.estado       = estado;
  }

  validar() {
    const errores = [];
    if (this.nombre && this.nombre.length < 2)
      errores.push('El nombre es demasiado corto');
    if (this.estado !== undefined && typeof this.estado !== 'boolean')
      errores.push('El estado debe ser booleano');
    return errores;
  }
}

module.exports = ActualizarMedicamentoDTO;