/**
 * Índice de la capa de Validaciones.
 * Centraliza todas las condiciones y reglas de validación del proyecto.
 */
const ValidadorBase = require('./validadorBase');
const authValidaciones = require('./authValidaciones');
const usuarioValidaciones = require('./usuarioValidaciones');
const medicamentoValidaciones = require('./medicamentoValidaciones');
const tratamientoValidaciones = require('./tratamientoValidaciones');
const recordatorioValidaciones = require('./recordatorioValidaciones');
const dosisValidaciones = require('./dosisValidaciones');
const calendarioValidaciones = require('./calendarioValidaciones');
const notificacionValidaciones = require('./notificacionValidaciones');
const reporteValidaciones = require('./reporteValidaciones');
const cuidadorValidaciones = require('./cuidadorValidaciones');
const rolValidaciones = require('./rolValidaciones');
const registroValidaciones = require('./registroValidaciones');
const commonValidaciones = require('./commonValidaciones');

module.exports = {
  ValidadorBase,
  ...authValidaciones,
  ...usuarioValidaciones,
  ...medicamentoValidaciones,
  ...tratamientoValidaciones,
  ...recordatorioValidaciones,
  ...dosisValidaciones,
  ...calendarioValidaciones,
  ...notificacionValidaciones,
  ...reporteValidaciones,
  ...cuidadorValidaciones,
  ...rolValidaciones,
  ...registroValidaciones,
  ...commonValidaciones
};
