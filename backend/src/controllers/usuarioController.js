const { Router } = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validarId = require('../middlewares/validarId');
const { Usuario, Rol, UsuarioRol } = require('../models');
const ActualizarUsuarioDTO = require('../dtos/usuario/ActualizarUsuarioDTO');
const UsuarioResponseDTO = require('../dtos/usuario/UsuarioResponseDTO');
const AsignarRolDTO = require('../dtos/rol/AsignarRolDTO');
const AsignacionRolResponseDTO = require('../dtos/rol/AsignacionRolResponseDTO');
const { ok, created } = require('../views/response');
const { ConflictError, NotFoundError } = require('../errors/AppError');

const router = Router();
const r = (handler) => asyncHandler(handler);

// ==========================================
// Orquestación y validación HTTP
// ==========================================

const listar = async (req, res) => {
  const usuarios = await Usuario.findAll();
  return ok(res, UsuarioResponseDTO.fromList(usuarios));
};

const obtener = async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id, {
    include: [{ model: Rol, as: 'roles' }]
  });
  if (!usuario) throw new NotFoundError('Usuario no encontrado');
  return ok(res, new UsuarioResponseDTO(usuario));
};

const actualizar = async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) throw new NotFoundError('Usuario no encontrado');

  // DTO de entrada: verifica formato JSON del payload
  const dto = ActualizarUsuarioDTO.from(req.body);

  await usuario.update({
    nombre_completo: dto.nombre_completo ?? usuario.nombre_completo,
    telefono: dto.telefono ?? usuario.telefono,
    edad: dto.edad ?? usuario.edad
  });

  // DTO de salida: verifica y estructura JSON
  return ok(res, new UsuarioResponseDTO(usuario), 'Usuario actualizado');
};

const desactivar = async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) throw new NotFoundError('Usuario no encontrado');

  await usuario.update({ estado: false });
  return ok(res, null, 'Usuario desactivado');
};

const asignarRol = async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
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

  // DTO de salida: verifica formato JSON
  return created(res, new AsignacionRolResponseDTO(asignacion), 'Rol asignado');
};

// ==========================================
// Endpoints definidos en el Controller
// ==========================================
router.get('/', r(listar));
router.get('/:id', validarId(), r(obtener));
router.put('/:id', validarId(), r(actualizar));
router.delete('/:id', validarId(), r(desactivar));
router.post('/:id/roles', validarId(), r(asignarRol));

module.exports = router;
module.exports.listar = listar;
module.exports.obtener = obtener;
module.exports.actualizar = actualizar;
module.exports.desactivar = desactivar;
module.exports.asignarRol = asignarRol;
