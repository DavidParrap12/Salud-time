/**
 * Condiciones y reglas de validación para los endpoints de Medicamentos.
 */
const crearMedicamentoCondiciones = {
  nombre: {
    required: true,
    type: 'string',
    min: 2,
    max: 150,
    message: 'El nombre del medicamento es obligatorio (entre 2 y 150 caracteres)'
  },
  presentacion: {
    type: 'string',
    max: 100,
    message: 'La presentación no puede superar 100 caracteres'
  },
  descripcion: {
    type: 'string',
    max: 255,
    message: 'La descripción no puede superar 255 caracteres'
  },
  fecha_vencimiento: {
    type: 'date',
    message: 'La fecha de vencimiento debe tener formato YYYY-MM-DD'
  }
};

const actualizarMedicamentoCondiciones = {
  nombre: {
    type: 'string',
    min: 2,
    max: 150,
    message: 'El nombre debe tener entre 2 y 150 caracteres'
  },
  presentacion: {
    type: 'string',
    max: 100,
    message: 'La presentación no puede superar 100 caracteres'
  },
  descripcion: {
    type: 'string',
    max: 255,
    message: 'La descripción no puede superar 255 caracteres'
  },
  fecha_vencimiento: {
    type: 'date',
    message: 'La fecha de vencimiento debe tener formato YYYY-MM-DD'
  },
  estado: {
    type: 'boolean',
    message: 'El estado debe ser verdadero o falso'
  }
};

const actualizarMedicamentoReglaCruzada = (datos) => {
  const campos = Object.keys(actualizarMedicamentoCondiciones);
  const enviados = campos.filter((campo) => datos[campo] !== undefined);
  return enviados.length ? [] : ['Debe enviar al menos un campo para actualizar'];
};

module.exports = {
  crearMedicamentoCondiciones,
  actualizarMedicamentoCondiciones,
  actualizarMedicamentoReglaCruzada
};
