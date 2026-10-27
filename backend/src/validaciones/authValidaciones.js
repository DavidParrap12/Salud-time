/**
 * Condiciones y reglas de validación para los endpoints de autenticación y registro.
 */
const registroPacienteCondiciones = {
  nombre_completo: {
    required: true,
    type: 'string',
    min: 3,
    max: 150,
    message: 'El nombre completo es obligatorio (entre 3 y 150 caracteres)'
  },
  correo: {
    required: true,
    type: 'email',
    max: 150,
    message: 'El correo no tiene un formato válido'
  },
  contrasena: {
    required: true,
    type: 'string',
    min: 8,
    max: 100,
    message: 'La contraseña debe tener al menos 8 caracteres'
  },
  edad: {
    required: true,
    type: 'int',
    min: 0,
    max: 120,
    message: 'La edad debe ser un número entero entre 0 y 120'
  },
  telefono: {
    type: 'string',
    max: 20,
    message: 'El teléfono no puede superar 20 caracteres'
  }
};

const registroEspecialistaCondiciones = {
  nombre_completo: {
    required: true,
    type: 'string',
    min: 3,
    max: 150,
    message: 'El nombre completo es obligatorio (entre 3 y 150 caracteres)'
  },
  correo: {
    required: true,
    type: 'email',
    max: 150,
    message: 'El correo no tiene un formato válido'
  },
  contrasena: {
    required: true,
    type: 'string',
    min: 8,
    max: 100,
    message: 'La contraseña debe tener al menos 8 caracteres'
  },
  edad: {
    required: true,
    type: 'int',
    min: 0,
    max: 120,
    message: 'La edad debe ser un número entero entre 0 y 120'
  },
  telefono: {
    type: 'string',
    max: 20,
    message: 'El teléfono no puede superar 20 caracteres'
  },
  id_especializacion: {
    required: true,
    type: 'int',
    min: 1,
    message: 'El id_especializacion es obligatorio y debe ser un entero positivo'
  }
};

const loginCondiciones = {
  correo: {
    required: true,
    type: 'email',
    message: 'El correo es obligatorio y debe tener un formato válido'
  },
  contrasena: {
    required: true,
    type: 'string',
    message: 'La contraseña es obligatoria'
  }
};

const recuperarPasswordCondiciones = {
  correo: {
    required: true,
    type: 'email',
    message: 'El correo es obligatorio y debe tener un formato válido'
  }
};

module.exports = {
  registroPacienteCondiciones,
  registroEspecialistaCondiciones,
  loginCondiciones,
  recuperarPasswordCondiciones
};
