const { Router } = require('express');
const endpoint = require('../http/endpoint');
const validarId = require('../middlewares/validarId');
const { Rol, Usuario, UsuarioRol } = require('../models');
const AsignarRolDTO = require('../dtos/rol/AsignarRolDTO');
const RolResponseDTO = require('../dtos/rol/RolResponseDTO');
const AsignacionRolResponseDTO = require('../dtos/rol/AsignacionRolResponseDTO');
const { ok, created } = require('../views/response');
const { ConflictError, NotFoundError } = require('../errors/AppError');

const router = Router();

// ==========================================
// Orquestación de los casos de uso
// ==========================================

const obtenerTodos = async () => {
  const roles = await Rol.findAll();
  return ok(RolResponseDTO.fromList(roles));
};

const obtenerPorId = async ({ params }) => {
  const rol = await Rol.findByPk(params.id);
  if (!rol) throw new NotFoundError('Rol no encontrado');
  return ok(new RolResponseDTO(rol));
};

const asignarRol = async ({ params, body: dto }) => {
  const usuario = await Usuario.findByPk(params.id_usuario);
  if (!usuario) throw new NotFoundError('Usuario no encontrado');

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

  return created(new AsignacionRolResponseDTO(asignacion), 'Rol asignado');
};

// ==========================================
// Endpoints definidos en el Controller
// ==========================================
router.get('/', endpoint(obtenerTodos));
router.get('/:id', validarId(), endpoint(obtenerPorId));
router.post('/asignar/:id_usuario', validarId('id_usuario'), endpoint(asignarRol, { body: AsignarRolDTO }));

module.exports = router;
module.exports.obtenerTodos = obtenerTodos;
module.exports.obtenerPorId = obtenerPorId;
module.exports.asignarRol = asignarRol;
