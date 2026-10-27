/**
 * Condiciones y reglas de validación para los endpoints de Calendario.
 */
const calendarioQueryCondiciones = {
  mes: {
    required: true,
    type: 'int',
    min: 1,
    max: 12,
    message: 'El mes es obligatorio y debe estar entre 1 y 12'
  },
  anio: {
    required: true,
    type: 'int',
    min: 2000,
    max: 2100,
    message: 'El año es obligatorio y debe estar entre 2000 y 2100'
  }
};

const calendarioFechaQueryCondiciones = {
  fecha: {
    required: true,
    type: 'date',
    message: 'La fecha es obligatoria y debe tener formato YYYY-MM-DD'
  }
};

module.exports = {
  calendarioQueryCondiciones,
  calendarioFechaQueryCondiciones
};
