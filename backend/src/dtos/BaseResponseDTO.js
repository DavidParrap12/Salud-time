/**
 * Base para todos los DTO de salida.
 *
 * Cada DTO declara `static fields` (la lista blanca de campos que se exponen).
 * Así se valida la salida: nunca se filtra `contrasena_hash` ni columnas
 * internas, y si un campo requerido falta se detecta antes de responder.
 */
class BaseResponseDTO {
  static fields = [];
  static requiredFields = null;

  constructor(source = {}) {
    const data =
      source && typeof source.toJSON === 'function' ? source.toJSON() : source || {};

    const campos = this.constructor.fields || [];
    for (const campo of campos) {
      this[campo] = data[campo];
    }

    const requeridos = this.constructor.requiredFields || campos;
    const faltantes = requeridos.filter((campo) => this[campo] === undefined);

    if (faltantes.length) {
      throw new Error(
        `DTO de salida ${this.constructor.name}: faltan campos [${faltantes.join(', ')}]`
      );
    }
  }

  static fromList(lista = []) {
    return (lista || []).map((item) => new this(item));
  }
}

module.exports = BaseResponseDTO;
