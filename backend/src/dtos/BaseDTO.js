const ValidadorBase = require('../validaciones/validadorBase');

/**
 * Base para todos los DTO de entrada (Request DTOs).
 *
 * Representa la estructura y tipos de datos recibidos en la petición HTTP (req).
 * Delega la evaluación de condiciones y reglas a la capa de validaciones (`src/validaciones/`).
 */
class BaseDTO {
  static from(data = {}) {
    const dto = new this(data || {});
    dto.validar();
    return dto;
  }

  static validarDatos(data = {}) {
    const reglas = this.rules();
    const reglasCruzadas = this.prototype.validarReglasCruzadas
      ? (d) => new this(d).validarReglasCruzadas()
      : null;

    return ValidadorBase.verificar(new this(data || {}), reglas, reglasCruzadas);
  }

  static rules() {
    return {};
  }

  // Helpers de normalización de datos para la petición HTTP
  static texto(valor) {
    return typeof valor === 'string' ? valor.trim() : valor;
  }

  static entero(valor) {
    if (valor === undefined || valor === null || valor === '') return undefined;
    return Number(valor);
  }

  validar() {
    const reglas = this.constructor.rules();
    const reglasCruzadas = typeof this.validarReglasCruzadas === 'function'
      ? () => this.validarReglasCruzadas()
      : null;

    ValidadorBase.validar(this, reglas, reglasCruzadas);
    return this;
  }
}

module.exports = BaseDTO;
