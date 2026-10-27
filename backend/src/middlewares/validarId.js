const IdParamDTO = require('../dtos/common/IdParamDTO');

/**
 * Valida un parámetro de ruta numérico usando un DTO.
 * Uso: router.get('/x/:id', validarId(), handler)
 */
module.exports = (param = 'id') => (req, res, next) => {
  try {
    IdParamDTO.from({ id: req.params[param] });
    return next();
  } catch (e) {
    return next(e);
  }
};
