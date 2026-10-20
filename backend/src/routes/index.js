const { Router } = require('express');

const auth           = require('../controllers/authController');
const calendario     = require('../controllers/calendarioController');
const cuidador       = require('../controllers/cuidadorController');
const dashboard      = require('../controllers/dashboardController');
const dosis          = require('../controllers/dosisController');
const especializacion = require('../controllers/especializacionController');
const medicamento    = require('../controllers/medicamentoController');
const notificacion   = require('../controllers/notificacionController');
const recordatorio   = require('../controllers/recordatorioController');
const registro       = require('../controllers/registrosDosisController');
const reporte        = require('../controllers/reporteController');
const rol            = require('../controllers/rolController');
const tratamiento    = require('../controllers/tratamientoController');
const usuario        = require('../controllers/usuarioController');

const router = Router();

// Autenticación
router.post('/auth/registro/paciente', auth.registrarPaciente);
router.post('/auth/registro/especialista', auth.registrarEspecialista);
router.post('/auth/login', auth.login);
router.post('/auth/recuperar-password', auth.recuperarPassword);

// Especializaciones
router.get('/especializaciones', especializacion.listar);

// Medicamentos
router.get('/medicamentos', medicamento.listar);
router.post('/medicamentos', medicamento.crear);
router.post('/medicamentos/validar', medicamento.validar);
router.get('/medicamentos/:id/vencimiento', medicamento.vencimiento);
router.get('/medicamentos/:id', medicamento.obtener);
router.put('/medicamentos/:id', medicamento.actualizar);
router.delete('/medicamentos/:id', medicamento.eliminar);

// Roles
router.get('/roles', rol.obtenerTodos);
router.get('/roles/:id', rol.obtenerPorId);
router.post('/roles/asignar/:id_usuario', rol.asignarRol);

// Usuarios
router.get('/usuarios', usuario.listar);
router.get('/usuarios/:id', usuario.obtener);
router.put('/usuarios/:id', usuario.actualizar);
router.delete('/usuarios/:id', usuario.desactivar);
router.post('/usuarios/:id/roles', usuario.asignarRol);

// Tratamientos
router.get('/tratamientos/paciente/:id_paciente', tratamiento.listarPorPaciente);
router.post('/tratamientos', tratamiento.crear);
router.get('/tratamientos/:id', tratamiento.obtener);
router.put('/tratamientos/:id', tratamiento.actualizar);
router.delete('/tratamientos/:id', tratamiento.desactivar);

// Recordatorios
router.get('/recordatorios/tratamiento/:id_tratamiento', recordatorio.listarPorTratamiento);
router.post('/recordatorios', recordatorio.crear);
router.put('/recordatorios/:id', recordatorio.actualizar);
router.delete('/recordatorios/:id', recordatorio.eliminar);
router.patch('/recordatorios/:id/hora', recordatorio.cambiarHora);
router.patch('/recordatorios/:id/dias', recordatorio.cambiarDias);
router.patch('/recordatorios/:id/medicamento', recordatorio.cambiarMedicamento);

// Dosis programadas
router.get('/dosis/pendientes', dosis.listarPendientes);
router.post('/dosis/alerta', dosis.generarAlerta);
router.post('/dosis/:id/confirmar', dosis.confirmar);
router.post('/dosis/:id/omitir', dosis.omitir);

// Calendario
router.get('/calendario/:id_usuario/fecha', calendario.porFecha);
router.get('/calendario/:id_usuario/tomadas', calendario.tomadas);
router.get('/calendario/:id_usuario/omitidas', calendario.omitidas);
router.get('/calendario/:id_usuario/historial', calendario.historial);
router.get('/calendario/:id_usuario', calendario.obtener);

// Dashboard
router.get('/dashboard/:id_usuario/medicamentos-hoy', dashboard.medicamentosHoy);
router.get('/dashboard/:id_usuario/dosis-pendientes', dashboard.dosisPendientes);
router.get('/dashboard/:id_usuario', dashboard.obtener);

// Notificaciones
router.get('/notificaciones/usuario/:id_usuario', notificacion.listarPorUsuario);
router.post('/notificaciones', notificacion.crear);
router.patch('/notificaciones/:id/leida', notificacion.marcarLeida);

// Reportes
router.post('/reportes/compartir', reporte.compartir);
router.post('/reportes', reporte.generar);
router.get('/reportes/:id/estadisticas', reporte.estadisticas);
router.get('/reportes/:id/cumplimiento', reporte.cumplimiento);
router.get('/reportes/:id', reporte.obtener);

// Cuidadores
router.get('/cuidadores/paciente/:id_paciente', cuidador.listarPorPaciente);
router.post('/cuidadores', cuidador.crear);
router.put('/cuidadores/:id', cuidador.actualizar);
router.delete('/cuidadores/:id', cuidador.eliminar);

// Registros de dosis
router.get('/registros', registro.listar);
router.get('/registros/:id', registro.obtener);

module.exports = router;
