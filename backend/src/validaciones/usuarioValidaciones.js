/**
 * Condiciones y reglas de validación para los endpoints de Usuarios.
 */
const actualizarUsuarioCondiciones = {
  nombre_completo: {
    type: 'string',
    min: 3,
    max: 150,
    message: 'El nombre debe tener entre 3 y 150 caracteres'
  },
  telefono: {
    type: 'string',
    max: 20,
    message: 'El teléfono no puede superar 20 caracteres'
  },
  edad: {
    type: 'int',
    min: 0,
    max: 120,
    message: 'La edad debe ser un número entero entre 0 y 120'
  }
};

const actualizarUsuarioReglaCruzada = (datos) => {
  const campos = Object.keys(actualizarUsuarioCondiciones);
  const enviados = campos.filter((campo) => datos[campo] !== undefined);
  return enviados.length ? [] : ['Debe enviar al menos un campo para actualizar'];
};

module.exports = {
  actualizarUsuarioCondiciones,
  actualizarUsuarioReglaCruzada
};
