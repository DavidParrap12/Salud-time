const { ValidationError } = require('../errors/AppError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

/**
 * Motor central de validación de condiciones y reglas.
 * Evalúa las condiciones definidas sobre los datos de la petición (req).
 */
class ValidadorBase {
  /**
   * Evalúa un campo según una condición/regla específica.
   */
  static validarCampo(campo, valor, regla = {}) {
    const vacio = valor === undefined || valor === null || valor === '';

    if (vacio) {
      return regla.required
        ? regla.message || `El campo "${campo}" es obligatorio`
        : null;
    }

    const mensaje = regla.message || `El campo "${campo}" no es válido`;

    if (regla.type) {
      const tipos = {
        string: () => typeof valor === 'string',
        email: () => typeof valor === 'string' && EMAIL_REGEX.test(valor),
        int: () => Number.isInteger(valor),
        number: () => typeof valor === 'number' && !Number.isNaN(valor),
        boolean: () => typeof valor === 'boolean',
        date: () => {
          if (typeof valor !== 'string') return false;
          if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
          const [anio, mes, dia] = valor.split('-').map(Number);
          const fecha = new Date(anio, mes - 1, dia);
          return (
            fecha.getFullYear() === anio &&
            fecha.getMonth() === mes - 1 &&
            fecha.getDate() === dia
          );
        },
        time: () => typeof valor === 'string' && TIME_REGEX.test(valor),
        array: () => Array.isArray(valor),
        enum: () => Array.isArray(regla.values) && regla.values.includes(valor)
      };

      const esValido = tipos[regla.type] ? tipos[regla.type]() : true;
      if (!esValido) return mensaje;
    }

    if (regla.regex && typeof valor === 'string' && !regla.regex.test(valor)) {
      return mensaje;
    }

    if (typeof valor === 'string' || Array.isArray(valor)) {
      if (regla.min !== undefined && valor.length < regla.min) return mensaje;
      if (regla.max !== undefined && valor.length > regla.max) return mensaje;
    }

    if (typeof valor === 'number') {
      if (regla.min !== undefined && valor < regla.min) return mensaje;
      if (regla.max !== undefined && valor > regla.max) return mensaje;
    }

    if (typeof regla.validate === 'function' && !regla.validate(valor)) {
      return mensaje;
    }

    return null;
  }

  /**
   * Ejecuta el conjunto de condiciones sobre el objeto de datos.
   * Lanza ValidationError si no se cumplen las condiciones.
   */
  static validar(datos = {}, reglas = {}, reglasCruzadasFn = null) {
    const errores = [];

    for (const [campo, regla] of Object.entries(reglas)) {
      const error = this.validarCampo(campo, datos[campo], regla);
      if (error) errores.push(error);
    }

    if (typeof reglasCruzadasFn === 'function') {
      const cruzados = reglasCruzadasFn(datos);
      if (Array.isArray(cruzados)) errores.push(...cruzados);
    }

    if (errores.length > 0) {
      throw new ValidationError(errores);
    }

    return datos;
  }

  /**
   * Evalúa las condiciones sin lanzar excepción, devolviendo { valido, errores }.
   */
  static verificar(datos = {}, reglas = {}, reglasCruzadasFn = null) {
    try {
      this.validar(datos, reglas, reglasCruzadasFn);
      return { valido: true, errores: [] };
    } catch (e) {
      if (e instanceof ValidationError) {
        return { valido: false, errores: e.detalles };
      }
      throw e;
    }
  }
}

module.exports = ValidadorBase;
