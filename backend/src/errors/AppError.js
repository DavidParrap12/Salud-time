class AppError extends Error {
  constructor(status, mensaje, detalles = null) {
    super(mensaje);
    this.name = this.constructor.name;
    this.status = status;
    this.detalles = detalles;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(detalles) {
    super(400, 'Datos inválidos', detalles);
  }
}

class BusinessError extends AppError {
  constructor(mensaje) {
    super(400, mensaje);
  }
}

class UnauthorizedError extends AppError {
  constructor(mensaje = 'No autorizado') {
    super(401, mensaje);
  }
}

class NotFoundError extends AppError {
  constructor(mensaje = 'Recurso no encontrado') {
    super(404, mensaje);
  }
}

class ConflictError extends AppError {
  constructor(mensaje = 'Conflicto con el estado actual del recurso') {
    super(409, mensaje);
  }
}

module.exports = {
  AppError,
  ValidationError,
  BusinessError,
  UnauthorizedError,
  NotFoundError,
  ConflictError
};
