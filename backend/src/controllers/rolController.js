const { Router } = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validarId = require('../middlewares/validarId');
const { Rol, Usuario, UsuarioRol } = require('../models');
const AsignarRolDTO = require('../dtos/rol/AsignarRolDTO');
const RolResponseDTO = require('../dtos/rol/RolResponseDTO');
const AsignacionRolResponseDTO = require('../dtos/rol/AsignacionRolResponseDTO');
const { ok, created } = require('../views/response');
const { ConflictError, NotFoundError } = require('../errors/AppError');

const router = Router();
const r = (handler) => asyncHandler(handler);

// ==========================================
// Orquestación y validación HTTP
// ==========================================

const obtenerTodos = async (req, res) => {
  const roles = await Rol.findAll();
  return ok(res, RolResponseDTO.fromList(roles));
};

const obtenerPorId = async (req, res) => {
  const rol = await Rol.findByPk(req.params.id);
  if (!rol) throw new NotFoundError('Rol no encontrado');
  return ok(res, new RolResponseDTO(rol));
};

const asignarRol = async (req, res) => {
  // Validación de la petición HTTP y recurso
  const usuario = await Usuario.findByPk(req.params.id_usuario);
  if (!usuario) throw new NotFoundError('Usuario no encontrado');

  // DTO de entrada: verifica formato JSON
  const dto = AsignarRolDTO.from(req.body);

  const rol = await Rol.findByPk(dto.id_rol);
  if (!rol) throw new NotFoundError('Rol no encontrado');

  const yaTiene = await UsuarioRol.findOne({
    where: { id_usuario: usuario.id_usuario, id_rol: rol.id_rol }
  });
  if (yaTiene) throw new ConflictError('El usuario ya tiene ese rol');

  const asignacion = await UsuarioRol.create({
    id_usuario: usuario.id_usuario,
    id_rol: rol.id_rol,
    id_especializacion: dto.id_especializacion
  });

  // DTO de salida: verifica y limpia JSON de salida
  return created(res, new AsignacionRolResponseDTO(asignacion), 'Rol asignado');
};

// ==========================================
// Endpoints definidos en el Controller
// ==========================================
router.get('/', r(obtenerTodos));
router.get('/:id', validarId(), r(obtenerPorId));
router.post('/asignar/:id_usuario', validarId('id_usuario'), r(asignarRol));

module.exports = router;
module.exports.obtenerTodos = obtenerTodos;
module.exports.obtenerPorId = obtenerPorId;
module.exports.asignarRol = asignarRol;
