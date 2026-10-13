class CrearCuidadorDTO {
  constructor({ id_paciente, correo_cuidador, parentesco }) {
    this.id_paciente      = Number(id_paciente);
    this.correo_cuidador  = correo_cuidador?.trim().toLowerCase();
    this.parentesco       = parentesco?.trim() || null;
  }

  validar() {
    const errores = [];
    if (!this.id_paciente || isNaN(this.id_paciente))
      errores.push('El paciente es obligatorio');
    if (!this.correo_cuidador || !/^[\w.-]+@[\w.-]+\.\w+$/.test(this.correo_cuidador))
      errores.push('El correo del cuidador no es válido');
    return errores;
  }
}

module.exports = CrearCuidadorDTO;