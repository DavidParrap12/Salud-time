/**
 * Resultados que devuelven los controllers.
 * El adaptador HTTP (src/http/endpoint.js) es quien escribe la respuesta.
 */
exports.ok = (data = null, mensaje = 'OK') => ({ status: 200, data, mensaje });

exports.created = (data = null, mensaje = 'Creado') => ({ status: 201, data, mensaje });
