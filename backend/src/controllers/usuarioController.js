const { Router } = require('express');
const endpoint = require('../http/endpoint');
const validarId = require('../middlewares/validarId');
const { Usuario, Rol, UsuarioRol } = require('../models');
const ActualizarUsuarioDTO = require('../dtos/usuario/ActualizarUsuarioDTO');
const UsuarioResponseDTO = require('../dtos/usuario/UsuarioResponseDTO');
const AsignarRolDTO = require('../dtos/rol/AsignarRolDTO');
const AsignacionRolResponseDTO = require('../dtos/rol/AsignacionRolResponseDTO');
const { ok, created } = require('../views/response');
const { ConflictError, NotFoundError } = require('../errors/AppError');

const router = Router();

// ==========================================
// Orquestación de los casos de uso
// ==========================================

const listar = async () => {
  const usuarios = await Usuario.findAll();
  return ok(UsuarioResponseDTO.fromList(usuarios));
};

const obtener = async ({ params }) => {
  const usuario = await Usuario.findByPk(params.id, {
    include: [{ model: Rol, as: 'roles' }]
  });
  if (!usuario) throw new NotFoundError('Usuario no encontrado');
  return ok(new UsuarioResponseDTO(usuario));
};

const actualizar = async ({ params, body: dto }) => {
  const usuario = await Usuario.findByPk(params.id);
  if (!usuario) throw new NotFoundError('Usuario no encontrado');

  await usuario.update({
    nombre_completo: dto.nombre_completo ?? usuario.nombre_completo,
    telefono: dto.telefono ?? usuario.telefono,
    edad: dto.edad ?? usuario.edad
  });

  return ok(new UsuarioResponseDTO(usuario), 'Usuario actualizado');
};

const desactivar = async ({ params }) => {
  const usuario = await Usuario.findByPk(params.id);
  if (!usuario) throw new NotFoundError('Usuario no encontrado');

  await usuario.update({ estado: false });
  return ok(null, 'Usuario desactivado');
};

const asignarRol = async ({ params, body: dto }) => {
  const usuario = await Usuario.findByPk(params.id);
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
router.get('/', endpoint(listar));
router.get('/:id', validarId(), endpoint(obtener));
router.put('/:id', validarId(), endpoint(actualizar, { body: ActualizarUsuarioDTO }));
router.delete('/:id', validarId(), endpoint(desactivar));
router.post('/:id/roles', validarId(), endpoint(asignarRol, { body: AsignarRolDTO }));

module.exports = router;
module.exports.listar = listar;
module.exports.obtener = obtener;
module.exports.actualizar = actualizar;
module.exports.desactivar = desactivar;
module.exports.asignarRol = asignarRol;
