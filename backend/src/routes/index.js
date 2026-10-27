const { Router } = require('express');

const authController = require('../controllers/authController');
const calendarioController = require('../controllers/calendarioController');
const cuidadorController = require('../controllers/cuidadorController');
const dashboardController = require('../controllers/dashboardController');
const dosisController = require('../controllers/dosisController');
const especializacionController = require('../controllers/especializacionController');
const medicamentoController = require('../controllers/medicamentoController');
const notificacionController = require('../controllers/notificacionController');
const recordatorioController = require('../controllers/recordatorioController');
const registrosDosisController = require('../controllers/registrosDosisController');
const reporteController = require('../controllers/reporteController');
const rolController = require('../controllers/rolController');
const tratamientoController = require('../controllers/tratamientoController');
const usuarioController = require('../controllers/usuarioController');

const router = Router();

// Cada controller expone sus propios endpoints, valida las peticiones HTTP
// y orquesta el flujo delegando a los DTOs la verificación del formato JSON.
router.use('/auth', authController);
router.use('/especializaciones', especializacionController);
router.use('/roles', rolController);
router.use('/usuarios', usuarioController);
router.use('/medicamentos', medicamentoController);
router.use('/tratamientos', tratamientoController);
router.use('/recordatorios', recordatorioController);
router.use('/dosis', dosisController);
router.use('/calendario', calendarioController);
router.use('/dashboard', dashboardController);
router.use('/notificaciones', notificacionController);
router.use('/reportes', reporteController);
router.use('/cuidadores', cuidadorController);
router.use('/registros', registrosDosisController);

module.exports = router;
