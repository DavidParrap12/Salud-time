class ActualizarCuidadorDTO {
  constructor(data = {}) {
    const { parentesco, estado } = data;
    this.parentesco = parentesco?.trim();
    this.estado     = estado;
  }

  validar() {
    const errores = [];
    if (this.estado !== undefined && typeof this.estado !== 'boolean')
      errores.push('El estado debe ser booleano');
    return errores;
  }
}

module.exports = ActualizarCuidadorDTO;
