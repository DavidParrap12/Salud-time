const { sequelize } = require('../models');

/**
 * Ejecuta varias operaciones en una transacción administrada.
 * Si `fn` lanza, Sequelize hace rollback automáticamente.
 */
const enTransaccion = (fn) => sequelize.transaction(fn);

module.exports = enTransaccion;
