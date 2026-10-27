const { Router } = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validarId = require('../middlewares/validarId');
const { Op } = require('sequelize');
const { Tratamiento, Recordatorio, DosisProgramada, Usuario } = require('../models');
const DashboardResponseDTO = require('../dtos/dashboard/DashboardResponseDTO');
const UsuarioResponseDTO = require('../dtos/usuario/UsuarioResponseDTO');
const DosisProgramadaResponseDTO = require('../dtos/dosis/DosisProgramadaResponseDTO');
const { ok } = require('../views/response');
const { NotFoundError } = require('../errors/AppError');
const { rangoDelDia } = require('../utils/fechas');

const router = Router();
const r = (handler) => asyncHandler(handler);

const dosisDelDia = async (idUsuario) => {
  const { inicio, fin } = rangoDelDia();

  return DosisProgramada.findAll({
    where: { fecha_hora: { [Op.between]: [inicio, fin] } },
    include: [{
      model: Recordatorio,
      as: 'recordatorio',
      required: true,
      include: [{
        model: Tratamiento,
        as: 'tratamiento',
        where: { id_paciente: idUsuario, estado: true },
        required: true
      }]
    }]
  });
};

// ==========================================
// Orquestación y validación HTTP
// ==========================================

const obtener = async (req, res) => {
  const idUsuario = req.params.id_usuario;

  const usuario = await Usuario.findByPk(idUsuario);
  if (!usuario) throw new NotFoundError('Usuario no encontrado');

  const dosisHoy = await dosisDelDia(idUsuario);

  const resumen = {
    total_hoy: dosisHoy.length,
    tomadas_hoy: dosisHoy.filter((d) => d.estado === 'TOMADA').length,
    pendientes_hoy: dosisHoy.filter((d) => d.estado === 'PENDIENTE').length,
    omitidas_hoy: dosisHoy.filter((d) => d.estado === 'OMITIDA').length
  };

  // DTO de salida: verifica y da formato JSON
  return ok(res, new DashboardResponseDTO({
    usuario: new UsuarioResponseDTO(usuario),
    medicamentosHoy: DosisProgramadaResponseDTO.fromList(dosisHoy),
    dosisPendientes: DosisProgramadaResponseDTO.fromList(
      dosisHoy.filter((d) => d.estado === 'PENDIENTE')
    ),
    resumen
  }));
};

const medicamentosHoy = async (req, res) => {
  const dosisHoy = await dosisDelDia(req.params.id_usuario);
  return ok(res, DosisProgramadaResponseDTO.fromList(dosisHoy));
};

const dosisPendientes = async (req, res) => {
  const dosis = await DosisProgramada.findAll({
    where: { estado: 'PENDIENTE' },
    include: [{
      model: Recordatorio,
      as: 'recordatorio',
      required: true,
      include: [{
        model: Tratamiento,
        as: 'tratamiento',
        where: { id_paciente: req.params.id_usuario, estado: true },
        required: true
      }]
    }]
  });

  return ok(res, DosisProgramadaResponseDTO.fromList(dosis));
};

// ==========================================
// Endpoints definidos en el Controller
// ==========================================
router.get('/:id_usuario/medicamentos-hoy', validarId('id_usuario'), r(medicamentosHoy));
router.get('/:id_usuario/dosis-pendientes', validarId('id_usuario'), r(dosisPendientes));
router.get('/:id_usuario', validarId('id_usuario'), r(obtener));

module.exports = router;
module.exports.obtener = obtener;
module.exports.medicamentosHoy = medicamentosHoy;
module.exports.dosisPendientes = dosisPendientes;
