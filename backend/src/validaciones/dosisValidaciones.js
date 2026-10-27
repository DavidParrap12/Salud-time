/**
 * Condiciones y reglas de validación para los endpoints de Dosis.
 */
const confirmarDosisCondiciones = {
  observaciones: {
    type: 'string',
    max: 255,
    message: 'Las observaciones no pueden superar 255 caracteres'
  }
};

const omitirDosisCondiciones = {
  motivo: {
    type: 'string',
    max: 255,
    message: 'El motivo no puede superar 255 caracteres'
  }
};

const generarAlertaCondiciones = {
  id_dosis_programada: {
    required: true,
    type: 'int',
    min: 1,
    message: 'La dosis programada es obligatoria'
  },
  id_usuario_destinatario: {
    required: true,
    type: 'int',
    min: 1,
    message: 'El destinatario es obligatorio'
  }
};

const dosisPendientesQueryCondiciones = {
  id_paciente: {
    type: 'int',
    min: 1,
    message: 'El id_paciente debe ser un entero positivo'
  }
};

module.exports = {
  confirmarDosisCondiciones,
  omitirDosisCondiciones,
  generarAlertaCondiciones,
  dosisPendientesQueryCondiciones
};
