/**
 * Condiciones y reglas de validación para los endpoints de Cuidadores.
 */
const crearCuidadorCondiciones = {
  id_paciente: {
    required: true,
    type: 'int',
    min: 1,
    message: 'El paciente es obligatorio'
  },
  correo_cuidador: {
    required: true,
    type: 'email',
    message: 'El correo del cuidador no es válido'
  },
  parentesco: {
    type: 'string',
    max: 50,
    message: 'El parentesco no puede superar 50 caracteres'
  }
};

const actualizarCuidadorCondiciones = {
  parentesco: {
    type: 'string',
    max: 50,
    message: 'El parentesco no puede superar 50 caracteres'
  },
  estado: {
    type: 'boolean',
    message: 'El estado debe ser verdadero o falso'
  }
};

const actualizarCuidadorReglaCruzada = (datos) => {
  const campos = Object.keys(actualizarCuidadorCondiciones);
  const enviados = campos.filter((campo) => datos[campo] !== undefined);
  return enviados.length ? [] : ['Debe enviar al menos un campo para actualizar'];
};

module.exports = {
  crearCuidadorCondiciones,
  actualizarCuidadorCondiciones,
  actualizarCuidadorReglaCruzada
};
