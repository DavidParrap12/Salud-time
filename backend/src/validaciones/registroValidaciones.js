/**
 * Condiciones y reglas de validación para Registros de Dosis.
 */
const registrosQueryCondiciones = {
  id_paciente: {
    type: 'int',
    min: 1,
    message: 'El id_paciente debe ser un entero positivo'
  }
};

module.exports = {
  registrosQueryCondiciones
};
