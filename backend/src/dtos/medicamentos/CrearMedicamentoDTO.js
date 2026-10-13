class CrearMedicamentoDTO {
  constructor({ nombre, presentacion, descripcion }) {
    this.nombre       = nombre?.trim();
    this.presentacion = presentacion?.trim() || null;
    this.descripcion  = descripcion?.trim() || null;
  }

  validar() {
    const errores = [];
    if (!this.nombre || this.nombre.length < 2)
      errores.push('El nombre del medicamento es obligatorio');
    return errores;
  }
}

module.exports = CrearMedicamentoDTO;