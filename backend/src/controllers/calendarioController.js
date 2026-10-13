const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Tratamiento = require('../models/Tratamiento');
const DosisProgramada = require('../models/DosisProgramada');

// DTOs
const CalendarioResponseDTO = require('../dtos/calendario/CalendarioResponseDTO');

// ──────────────────────────────────────────────
// Obtener calendario de dosis de un paciente
// ──────────────────────────────────────────────
const obtenerCalendario = async (req, res) => {
  try {
    const { id_paciente } = req.params;
    const mes = parseInt(req.query.mes) || (new Date().getMonth() + 1); // 1-12
    const anio = parseInt(req.query.anio) || new Date().getFullYear();

    // Validar mes y año
    if (mes < 1 || mes > 12) {
      return res.status(400).json({ ok: false, mensaje: 'El mes debe estar entre 1 y 12' });
    }
    if (anio < 2000 || anio > 2100) {
      return res.status(400).json({ ok: false, mensaje: 'El año no es válido' });
    }

    // Calcular rango de fechas del mes
    const fechaInicio = new Date(anio, mes - 1, 1, 0, 0, 0);
    const fechaFin = new Date(anio, mes, 0, 23, 59, 59); // Último día del mes

    // Obtener tratamientos del paciente
    const tratamientos = await Tratamiento.findAll({
      where: { id_paciente },
      attributes: ['id_tratamiento']
    });

    if (!tratamientos.length) {
      return res.status(200).json({
        ok: true,
        data: new CalendarioResponseDTO({ mes, anio, dias: [] })
      });
    }

    // Obtener dosis programadas del mes
    // TODO: Ajustar la relación tratamiento → recordatorio → dosis_programada
    const dosisDelMes = await DosisProgramada.findAll({
      where: {
        fecha_hora: {
          [Op.between]: [fechaInicio, fechaFin]
        }
      },
      order: [['fecha_hora', 'ASC']]
    });

    // Agrupar dosis por día
    const diasMap = {};

    dosisDelMes.forEach(d => {
      const fecha = new Date(d.fecha_hora);
      const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;

      if (!diasMap[clave]) {
        diasMap[clave] = { fecha: clave, tomadas: 0, omitidas: 0, total: 0 };
      }

      diasMap[clave].total++;

      if (d.estado === 'TOMADA') {
        diasMap[clave].tomadas++;
      } else if (d.estado === 'OMITIDA') {
        diasMap[clave].omitidas++;
      }
    });

    // Convertir el mapa a array ordenado por fecha
    const dias = Object.values(diasMap).sort((a, b) => a.fecha.localeCompare(b.fecha));

    const respuesta = new CalendarioResponseDTO({ mes, anio, dias });

    return res.status(200).json({
      ok: true,
      data: respuesta
    });
  } catch (error) {
    console.error('Error en obtenerCalendario:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

module.exports = {
  obtenerCalendario
};
