const { Op } = require('sequelize');
const Usuario = require('../models/Usuario');
const Tratamiento = require('../models/Tratamiento');
const DosisProgramada = require('../models/DosisProgramada');

// DTOs
const DashboardResponseDTO = require('../dtos/dashboards/DashboardResponseDTO');

// ──────────────────────────────────────────────
// Obtener dashboard del usuario
// ──────────────────────────────────────────────
const obtenerDashboard = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    // Obtener datos del usuario
    const usuario = await Usuario.findByPk(id_usuario);
    if (!usuario) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    }

    // Definir rango de hoy (inicio y fin del día)
    const hoy = new Date();
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0);
    const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);

    // Obtener tratamientos activos del paciente
    const tratamientos = await Tratamiento.findAll({
      where: {
        id_paciente: id_usuario,
        estado: true
      }
    });

    const idsTratamiento = tratamientos.map(t => t.id_tratamiento);

    // Obtener dosis programadas de hoy para los tratamientos del paciente
    // TODO: La relación entre tratamiento y dosis_programada se hace a través
    // de un recordatorio. Ajustar la query cuando se defina la tabla recordatorio.
    const dosisHoy = await DosisProgramada.findAll({
      where: {
        fecha_hora: {
          [Op.between]: [inicioHoy, finHoy]
        }
      }
    });

    // Calcular resumen por estado
    const total_hoy = dosisHoy.length;
    const tomadas_hoy = dosisHoy.filter(d => d.estado === 'TOMADA').length;
    const pendientes_hoy = dosisHoy.filter(d => d.estado === 'PENDIENTE').length;
    const omitidas_hoy = dosisHoy.filter(d => d.estado === 'OMITIDA').length;

    // Dosis pendientes del día
    const dosisPendientes = dosisHoy.filter(d => d.estado === 'PENDIENTE');

    // Medicamentos de hoy (nombres únicos de los tratamientos activos)
    const medicamentosHoy = tratamientos.map(t => ({
      id_tratamiento: t.id_tratamiento,
      id_medicamento: t.id_medicamento,
      dosis: t.dosis
    }));

    const respuesta = new DashboardResponseDTO({
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre_completo: usuario.nombre_completo
      },
      medicamentosHoy,
      dosisPendientes,
      resumen: {
        total_hoy,
        tomadas_hoy,
        pendientes_hoy,
        omitidas_hoy
      }
    });

    return res.status(200).json({
      ok: true,
      data: respuesta
    });
  } catch (error) {
    console.error('Error en obtenerDashboard:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

module.exports = {
  obtenerDashboard
};
