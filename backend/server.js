const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/models');
const routes = require('./src/routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    ok: true,
    mensaje: 'API Salud Time',
    endpoints: '/api/health',
    documentacion: 'Ver README.md'
  });
});

app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ ok: true, mensaje: 'API y base de datos conectadas' });
  } catch (e) {
    res.status(500).json({ ok: false, mensaje: 'Sin conexión a la base de datos', detalle: e.message });
  }
});

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ ok: false, mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ ok: false, mensaje: 'Error interno del servidor', detalle: err.message });
});

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
