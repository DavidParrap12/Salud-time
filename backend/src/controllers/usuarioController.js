const { Usuario, Rol, UsuarioRol } = require('../models');
const ActualizarUsuarioDTO = require('../dtos/usuario/ActualizarUsuarioDTO');
const UsuarioResponseDTO   = require('../dtos/usuario/UsuarioResponseDTO');
const AsignarRolDTO        = require('../dtos/rol/AsignarRolDTO');
const { ok, created, error } = require('../views/response');

exports.listar = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    return ok(res, UsuarioResponseDTO.fromList(usuarios));
  } catch (e) {
    return error(res, 500, 'Error al listar usuarios', e.message);
  }
};

exports.obtener = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      include: [{ model: Rol, as: 'roles' }]
    });
    if (!usuario) return error(res, 404, 'Usuario no encontrado');
    return ok(res, new UsuarioResponseDTO(usuario));
  } catch (e) {
    return error(res, 500, 'Error al obtener usuario', e.message);
  }
};

exports.actualizar = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return error(res, 404, 'Usuario no encontrado');

    const dto = new ActualizarUsuarioDTO(req.body || {});
    const errores = dto.validar();
    if (errores.length) return error(res, 400, 'Datos inválidos', errores);

    await usuario.update({
      nombre_completo: dto.nombre_completo ?? usuario.nombre_completo,
      telefono: dto.telefono        ?? usuario.telefono,
      edad:     dto.edad            ?? usuario.edad
    });

    return ok(res, new UsuarioResponseDTO(usuario), 'Usuario actualizado');
  } catch (e) {
    return error(res, 500, 'Error al actualizar usuario', e.message);
  }
};

exports.desactivar = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return error(res, 404, 'Usuario no encontrado');
    await usuario.update({ estado: false });
    return ok(res, null, 'Usuario desactivado');
  } catch (e) {
    return error(res, 500, 'Error al desactivar usuario', e.message);
  }
};

exports.asignarRol = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return error(res, 404, 'Usuario no encontrado');

    const dto = new AsignarRolDTO(req.body || {});
    const errores = dto.validar();
    if (errores.length) return error(res, 400, 'Datos inválidos', errores);

    const rol = await Rol.findByPk(dto.id_rol);
    if (!rol) return error(res, 404, 'Rol no encontrado');

    const yaTiene = await UsuarioRol.findOne({
      where: { id_usuario: usuario.id_usuario, id_rol: rol.id_rol }
    });
    if (yaTiene) return error(res, 409, 'El usuario ya tiene ese rol');

    const asignacion = await UsuarioRol.create({
      id_usuario: usuario.id_usuario,
      id_rol: rol.id_rol
    });

    return created(res, asignacion, 'Rol asignado');
  } catch (e) {
    return error(res, 500, 'Error al asignar rol', e.message);
  }
};