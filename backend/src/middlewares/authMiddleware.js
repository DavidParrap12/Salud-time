const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { UnauthorizedError, ForbiddenError } = require('../errors/AppError');

/**
 * Middleware para validar y consumir el token JWT.
 *
 * 1. Extrae el token del header Authorization: Bearer <token>.
 * 2. Valida la firma y expiración con JWT_SECRET.
 * 3. Comprueba que el usuario exista en PostgreSQL y esté activo.
 * 4. Adjunta el usuario autenticado a `req.usuario`.
 */
const autenticar = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError(
        'Token de autenticación no proporcionado. Debe incluir el header "Authorization: Bearer <token>"'
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Token de autenticación vacío o malformado');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedError('El token ha expirado. Por favor inicie sesión nuevamente');
      }
      throw new UnauthorizedError('Token de autenticación inválido');
    }

    const usuario = await Usuario.findByPk(decoded.id_usuario);
    if (!usuario) {
      throw new UnauthorizedError('Usuario asociado al token no existe');
    }
    if (!usuario.estado) {
      throw new UnauthorizedError('La cuenta de usuario está desactivada');
    }

    req.usuario = {
      id_usuario: usuario.id_usuario,
      correo: usuario.correo,
      nombre_completo: usuario.nombre_completo,
      roles: decoded.roles || []
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware opcional para restringir acceso por roles (ej: 'MEDICO', 'PACIENTE').
 */
const autorizarRoles = (...rolesPermitidos) => (req, res, next) => {
  if (!req.usuario) {
    return next(new UnauthorizedError('Usuario no autenticado'));
  }

  const tieneRol = (req.usuario.roles || []).some((r) => rolesPermitidos.includes(r));
  if (!tieneRol) {
    return next(
      new ForbiddenError(
        `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}`
      )
    );
  }

  next();
};

module.exports = {
  autenticar,
  autorizarRoles
};
