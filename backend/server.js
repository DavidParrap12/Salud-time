const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/models');
const flowLogger = require('./src/middlewares/flowLogger');
const { autenticar } = require('./src/middlewares/authMiddleware');
const notFound = require('./src/middlewares/notFound');
const errorHandler = require('./src/middlewares/errorHandler');

// Cada controller define sus propios endpoints y expone un router.
const health = require('./src/controllers/healthController');
const auth = require('./src/controllers/authController');
const calendario = require('./src/controllers/calendarioController');
const cuidador = require('./src/controllers/cuidadorController');
const dashboard = require('./src/controllers/dashboardController');
const dosis = require('./src/controllers/dosisController');
const especializacion = require('./src/controllers/especializacionController');
const medicamento = require('./src/controllers/medicamentoController');
const notificacion = require('./src/controllers/notificacionController');
const recordatorio = require('./src/controllers/recordatorioController');
const registro = require('./src/controllers/registrosDosisController');
const reporte = require('./src/controllers/reporteController');
const rol = require('./src/controllers/rolController');
const tratamiento = require('./src/controllers/tratamientoController');
const usuario = require('./src/controllers/usuarioController');

const app = express();

app.use(cors());
app.use(express.json());
app.use(flowLogger);

// Endpoints públicos de la API (no requieren JWT)
app.use('/api', health.router);
app.use('/api/auth', auth);

// Endpoints públicos directos en la raíz
app.use('/', health.router);

// Middleware de autenticación: verifica y consume el token JWT
// Todas las rutas declaradas a continuación requieren "Authorization: Bearer <token>"
app.use('/api', autenticar);

// Endpoints protegidos de la API (requieren y consumen JWT)
app.use('/api/especializaciones', especializacion);
app.use('/api/roles', rol);
app.use('/api/usuarios', usuario);
app.use('/api/medicamentos', medicamento);
app.use('/api/tratamientos', tratamiento);
app.use('/api/recordatorios', recordatorio);
app.use('/api/dosis', dosis);
app.use('/api/calendario', calendario);
app.use('/api/dashboard', dashboard);
app.use('/api/notificaciones', notificacion);
app.use('/api/reportes', reporte);
app.use('/api/cuidadores', cuidador);
app.use('/api/registros', registro);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

sequelize
  .authenticate()
  .then(() => {
    console.log('Base de datos conectada');
    app.listen(PORT, () => {
      console.log(`Servidor Salud Time escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((e) => {
    console.error('No se pudo conectar a la base de datos:', e.message);
    process.exit(1);
  });
