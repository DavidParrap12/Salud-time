const asyncHandler = require('../middlewares/asyncHandler');
const { ok } = require('../views/response');

/**
 * Adaptador HTTP de los controllers.
 *
 * Es el ÚNICO lugar que conoce `req` y `res`. Se encarga de:
 *   1. Construir y validar los DTOs de entrada (body / query).
 *   2. Pasar al controller un objeto plano { body, params, query }.
 *   3. Escribir la respuesta usando el resultado que devuelve el controller.
 *
 * Los controllers no reciben `req` ni `res`.
 */
const construir = (DTO, datos) => (DTO ? DTO.from(datos || {}) : datos || {});

const endpoint = (handler, opciones = {}) => {
  const { body: BodyDTO = null, query: QueryDTO = null } = opciones;

  return asyncHandler(async (req, res) => {
    const entrada = {
      body: construir(BodyDTO, req.body),
      params: req.params || {},
      query: construir(QueryDTO, req.query),
      usuario: req.usuario || null
    };

    const resultado = await handler(entrada);

    const respuesta =
      resultado && typeof resultado === 'object' && 'status' in resultado
        ? resultado
        : ok(resultado);

    return res.status(respuesta.status).json({
      success: true,
      mensaje: respuesta.mensaje,
      data: respuesta.data ?? null
    });
  });
};

module.exports = endpoint;
