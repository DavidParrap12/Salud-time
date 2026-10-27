/**
 * Condiciones y reglas de validación para los endpoints de Recordatorios.
 */
const crearRecordatorioCondiciones = {
  id_tratamiento: {
    required: true,
    type: 'int',
    min: 1,
    message: 'El tratamiento es obligatorio'
  },
  hora: {
    required: true,
    type: 'time',
    message: 'La hora debe tener formato HH:MM o HH:MM:SS'
  },
  dias_semana: {
    required: true,
    type: 'string',
    max: 50,
    message: 'Los días de la semana son obligatorios (máximo 50 caracteres)'
  },
  fecha_inicio: {
    required: true,
    type: 'date',
    message: 'La fecha de inicio es obligatoria (YYYY-MM-DD)'
  },
  fecha_fin: {
    type: 'date',
    message: 'La fecha de fin debe tener formato YYYY-MM-DD'
  }
};

const crearRecordatorioReglaCruzada = (datos) => {
  if (datos.fecha_inicio && datos.fecha_fin && new Date(datos.fecha_fin) < new Date(datos.fecha_inicio)) {
    return ['La fecha de fin no puede ser anterior a la fecha de inicio'];
  }
  return [];
};

const actualizarRecordatorioCondiciones = {
  hora: {
    type: 'time',
    message: 'La hora debe tener formato HH:MM o HH:MM:SS'
  },
  dias_semana: {
    type: 'string',
    max: 50,
    message: 'Los días de la semana no pueden estar vacíos (máximo 50 caracteres)'
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

const actualizarRecordatorioReglaCruzada = (datos) => {
  const errores = [];
  const campos = Object.keys(actualizarRecordatorioCondiciones);
  const enviados = campos.filter((campo) => datos[campo] !== undefined);

  if (!enviados.length) errores.push('Debe enviar al menos un campo para actualizar');
  if (datos.fecha_inicio && datos.fecha_fin && new Date(datos.fecha_fin) < new Date(datos.fecha_inicio)) {
    errores.push('La fecha de fin no puede ser anterior a la fecha de inicio');
  }
  return errores;
};

const cambiarHoraCondiciones = {
  hora: {
    required: true,
    type: 'time',
    message: 'La hora es obligatoria y debe tener formato HH:MM'
  }
};

const cambiarDiasCondiciones = {
  dias_semana: {
    required: true,
    type: 'string',
    max: 50,
    message: 'Los días de la semana son obligatorios (máximo 50 caracteres)'
  }
};

module.exports = {
  crearRecordatorioCondiciones,
  crearRecordatorioReglaCruzada,
  actualizarRecordatorioCondiciones,
  actualizarRecordatorioReglaCruzada,
  cambiarHoraCondiciones,
  cambiarDiasCondiciones
};
