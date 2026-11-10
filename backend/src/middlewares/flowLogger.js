/**
 * Middleware para observar el flujo de peticiones HTTP en tiempo real.
 * Permite monitorear la entrada de la petición, parámetros y la salida HTTP con su tiempo de respuesta.
 */
function flowLogger(req, res, next) {
  const inicio = Date.now();
  const hora = new Date().toLocaleTimeString('es-CO', { hour12: false });
  const metodo = req.method.padEnd(6);
  const ruta = req.originalUrl || req.url;

  console.log(`\x1b[36m[FLUJO ENTRADA ${hora}]\x1b[0m ${metodo} ${ruta}`);

  res.on('finish', () => {
    const duracion = Date.now() - inicio;
    const status = res.statusCode;

    let colorStatus = '\x1b[32m'; // Verde (2xx)
    if (status >= 300 && status < 400) colorStatus = '\x1b[33m'; // Amarillo (3xx)
    else if (status >= 400 && status < 500) colorStatus = '\x1b[35m'; // Magenta (4xx cliente)
    else if (status >= 500) colorStatus = '\x1b[31m'; // Rojo (5xx servidor)

    console.log(
      `\x1b[34m[FLUJO SALIDA  ${hora}]\x1b[0m ${metodo} ${ruta} -> ${colorStatus}${status}\x1b[0m (${duracion}ms)`
    );
  });

  next();
}

module.exports = flowLogger;
