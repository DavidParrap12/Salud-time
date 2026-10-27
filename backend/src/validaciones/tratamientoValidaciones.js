/**
 * Condiciones y reglas de validación para los endpoints de Tratamientos.
 */
const crearTratamientoCondiciones = {
  id_paciente: {
    required: true,
    type: 'int',
    min: 1,
    message: 'El paciente es obligatorio'
  },
  id_medicamento: {
    required: true,
    type: 'int',
    min: 1,
    message: 'El medicamento es obligatorio'
  },
  id_medico: {
    type: 'int',
    min: 1,
    message: 'El médico debe ser un id válido'
  },
  dosis: {
    required: true,
    type: 'string',
    max: 100,
    message: 'La dosis es obligatoria (máximo 100 caracteres)'
  },
  fecha_inicio: {
    type: 'date',
    message: 'La fecha de inicio debe tener formato YYYY-MM-DD'
  },
  fecha_fin: {
    type: 'date',
    message: 'La fecha de fin debe tener formato YYYY-MM-DD'
  }
};

const crearTratamientoReglaCruzada = (datos) => {
  if (datos.fecha_inicio && datos.fecha_fin && new Date(datos.fecha_fin) < new Date(datos.fecha_inicio)) {
    return ['La fecha de fin no puede ser anterior a la fecha de inicio'];
  }
  return [];
};

const actualizarTratamientoCondiciones = {
  dosis: {
    type: 'string',
    max: 100,
    message: 'La dosis no puede estar vacía ni superar 100 caracteres'
  },
  fecha_inicio: {
    type: 'date',
    message: 'La fecha de inicio debe tener formato YYYY-MM-DD'
  },
  fecha_fin: {
    type: 'date',
    message: 'La fecha de fin debe tener formato YYYY-MM-DD'
  },
  estado: {
    type: 'boolean',
    message: 'El estado debe ser verdadero o falso'
  }
};

const actualizarTratamientoReglaCruzada = (datos) => {
  const errores = [];
  const campos = Object.keys(actualizarTratamientoCondiciones);
  const enviados = campos.filter((campo) => datos[campo] !== undefined);

  if (!enviados.length) errores.push('Debe enviar al menos un campo para actualizar');
  if (datos.fecha_inicio && datos.fecha_fin && new Date(datos.fecha_fin) < new Date(datos.fecha_inicio)) {
    errores.push('La fecha de fin no puede ser anterior a la fecha de inicio');
  }
  return errores;
};

module.exports = {
  crearTratamientoCondiciones,
  crearTratamientoReglaCruzada,
  actualizarTratamientoCondiciones,
  actualizarTratamientoReglaCruzada
};
