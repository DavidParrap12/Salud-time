/**
 * Servidor del frontend Salud Time.
 *
 * Sirve los archivos estáticos de `public/` y hace de proxy para `/api`,
 * de modo que el navegador habla con un solo origen (sin problemas de CORS)
 * y el backend puede seguir escuchando en su propio puerto.
 *
 * Uso:
 *   npm start
 *
 * Variables opcionales:
 *   FRONTEND_PORT=4000
 *   API_URL=http://localhost:3000
 */
const express = require('express');
const http = require('http');
const https = require('https');
const path = require('path');

const app = express();

const PORT = Number(process.env.FRONTEND_PORT || 4000);
const API_URL = process.env.API_URL || 'http://localhost:3000';
const destino = new URL(API_URL);
const transporte = destino.protocol === 'https:' ? https : http;

// Proxy de la API. Se monta antes de los archivos estáticos.
app.use('/api', (req, res) => {
  const proxyReq = transporte.request(
    {
      protocol: destino.protocol,
      hostname: destino.hostname,
      port: destino.port || (destino.protocol === 'https:' ? 443 : 80),
      path: req.originalUrl,
      method: req.method,
      headers: { ...req.headers, host: destino.host }
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on('error', (error) => {
    console.error(`[proxy] No se pudo conectar con ${API_URL}:`, error.message);
    if (!res.headersSent) {
      res.status(502).json({
        success: false,
        mensaje: 'No se pudo conectar con el backend. Verifique que esté corriendo.',
        detalles: [error.message]
      });
    }
  });

  req.pipe(proxyReq);
});

app.use(express.static(path.join(__dirname, '../public')));

// La raíz siempre lleva al login; el propio login redirige si ya hay sesión.
app.get('/', (req, res) => {
  res.redirect('/inicio-sesion/login.html');
});

app.listen(PORT, () => {
  console.log(`Frontend Salud Time en http://localhost:${PORT}`);
  console.log(`API conectada en ${API_URL}`);
});
