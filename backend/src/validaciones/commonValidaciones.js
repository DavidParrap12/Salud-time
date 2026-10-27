/**
 * Condiciones de validación comunes (por ejemplo, identificadores de ruta).
 */
const idParamCondiciones = {
  id: {
    required: true,
    type: 'int',
    min: 1,
    message: 'El identificador debe ser un entero positivo'
  }
};

module.exports = {
  idParamCondiciones
};
