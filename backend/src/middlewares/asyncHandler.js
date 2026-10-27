/**
 * Envuelve handlers async para que cualquier rechazo llegue al middleware
 * global de errores. Los controllers quedan sin try/catch.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
