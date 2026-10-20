const { Rol, Usuario, UsuarioRol } = require('../models');
const AsignarRolDTO  = require('../dtos/rol/AsignarRolDTO');
const RolResponseDTO = require('../dtos/rol/RolResponseDTO');
const { ok, created, error } = require('../views/response');

const obtenerTodos = async (req, res) => {
  try {
    const roles = await Rol.findAll();
    return ok(res, RolResponseDTO.fromList(roles));
  } catch (e) {
    return error(res, 500, 'Error al listar roles', e.message);
  }
};

const obtenerPorId = async (req, res) => {
  try {
    const rol = await Rol.findByPk(req.params.id);
    if (!rol) return error(res, 404, 'Rol no encontrado');
    return ok(res, new RolResponseDTO(rol));
  } catch (e) {
    return error(res, 500, 'Error al obtener rol', e.message);
  }
};

const asignarRol = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id_usuario);
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
      id_rol: rol.id_rol,
      id_especializacion: dto.id_especializacion
    });

    return created(res, asignacion, 'Rol asignado');
  } catch (e) {
    return error(res, 500, 'Error al asignar rol', e.message);
  }
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  asignarRol
};
