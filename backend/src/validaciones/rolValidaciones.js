/**
 * Condiciones y reglas de validación para los endpoints de Roles.
 */
const asignarRolCondiciones = {
  id_rol: {
    required: true,
    type: 'int',
    min: 1,
    message: 'El id_rol es obligatorio'
  },
  id_especializacion: {
    type: 'int',
    min: 1,
    message: 'La especialización debe ser un id válido'
  }
};

module.exports = {
  asignarRolCondiciones
};
