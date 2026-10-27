const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const { sequelize } = require('./src/models');
const routes = require('./src/routes');
const notFound = require('./src/middlewares/notFound');
const errorHandler = require('./src/middlewares/errorHandler');
const flowLogger = require('./src/middlewares/flowLogger');
const swaggerDocument = require('./src/docs/openapi');

const app = express();

app.use(cors());
app.use(express.json());

// Middleware para observar el flujo de las peticiones HTTP en consola
app.use(flowLogger);

// Documentación interactiva Swagger UI (similar a FastAPI /docs)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'Salud Time API - Swagger Docs'
}));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'Salud Time API - Swagger Docs'
}));

// Endpoint para obtener la especificación OpenAPI en formato JSON
app.get('/api/openapi.json', (req, res) => {
  res.json(swaggerDocument);
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    mensaje: 'API Salud Time',
    version: '1.0.0',
    salud: '/api/health',
    documentacion_interactiva_swagger: '/docs',
    especificacion_openapi: '/api/openapi.json',
    endpoints: '/api',
    guia: 'Ver README.md y api.http'
  });
});

// Alias /api/health y /api/salud para monitoreo
app.get(['/api/health', '/api/salud'], async (req, res) => {
  try {
    await sequelize.authenticate();
    return res.json({ success: true, mensaje: 'API y base de datos conectadas' });
  } catch (e) {
    return res.status(503).json({
      success: false,
      mensaje: 'Sin conexión a la base de datos',
      detalles: e.message
    });
  }
});

// Montaje de rutas y controllers modulares
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

sequelize
  .authenticate()
  .then(() => {
    console.log('Base de datos conectada');
    app.listen(PORT, () => {
      console.log(`Servidor Salud Time escuchando en http://localhost:${PORT}`);
      console.log(`Documentación interactiva (Swagger / FastAPI-like) en: http://localhost:${PORT}/docs`);
    });
  })
  .catch((e) => {
    console.error('No se pudo conectar a la base de datos:', e.message);
    process.exit(1);
  });
