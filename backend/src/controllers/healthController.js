const { Router } = require('express');
const { sequelize } = require('../models');
const endpoint = require('../http/endpoint');
const { ok } = require('../views/response');

const inicio = async () =>
  ok(
    {
      mensaje: 'API Salud Time',
      version: '1.0.0',
      salud: '/api/health',
      endpoints: '/api',
      documentacion: 'Ver README.md y api.http'
    },
    'API Salud Time'
  );

const salud = async () => {
  await sequelize.authenticate();
  return ok({ base_datos: 'conectada' }, 'API y base de datos conectadas');
};

const router = Router();
router.get('/', endpoint(inicio));
router.get('/health', endpoint(salud));
router.get('/salud', endpoint(salud));

module.exports = { router, inicio, salud };
