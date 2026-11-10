const { AppError } = require('../errors/AppError');

/**
 * Traduce cualquier excepción a una respuesta HTTP uniforme.
 * Los controllers solo lanzan errores; aquí se decide el status.
 */
module.exports = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let status = 500;
  let mensaje = 'Error interno del servidor';
  let detalles = null;

  if (err instanceof AppError) {
    status = err.status;
    mensaje = err.message;
    detalles = err.detalles;
  } else if (err.name === 'SequelizeValidationError') {
    status = 400;
    mensaje = 'Datos inválidos';
    detalles = err.errors.map((e) => e.message);
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    status = 409;
    mensaje = 'El registro ya existe';
    detalles = err.errors.map((e) => e.message);
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    status = 400;
    mensaje = 'Referencia inválida: el registro relacionado no existe';
  } else if (
    [
      'SequelizeConnectionError',
      'SequelizeConnectionRefusedError',
      'SequelizeHostNotFoundError',
      'SequelizeAccessDeniedError'
    ].includes(err.name)
  ) {
    status = 503;
    mensaje = 'Sin conexión a la base de datos';
    detalles = err.message;
  } else {
    console.error('[error]', err);
    detalles = err.message;
  }

  return res.status(status).json({
    success: false,
    mensaje,
    detalles
  });
};
