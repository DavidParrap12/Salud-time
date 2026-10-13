const Rol = require('../models/Rol');

// DTOs
const AsignarRolDTO = require('../dtos/rol/AsignarRolDTO');
const RolResponseDTO = require('../dtos/rol/RolResponseDTO');

// ──────────────────────────────────────────────
// Obtener todos los roles
// ──────────────────────────────────────────────
const obtenerTodos = async (req, res) => {
  try {
    const roles = await Rol.findAll();

    return res.status(200).json({
      ok: true,
      data: RolResponseDTO.fromList(roles)
    });
  } catch (error) {
    console.error('Error en obtenerTodos roles:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// Obtener rol por ID
// ──────────────────────────────────────────────
const obtenerPorId = async (req, res) => {
  try {
    const rol = await Rol.findByPk(req.params.id);
    if (!rol) {
      return res.status(404).json({ ok: false, mensaje: 'Rol no encontrado' });
    }

    return res.status(200).json({
      ok: true,
      data: new RolResponseDTO(rol)
    });
  } catch (error) {
    console.error('Error en obtenerPorId rol:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// Asignar rol a usuario
// TODO: Se necesita crear el modelo 'usuario_rol' (tabla intermedia)
// para implementar la lógica de asignación completa
// ──────────────────────────────────────────────
const asignarRol = async (req, res) => {
  try {
    const dto = new AsignarRolDTO(req.body);
    const errores = dto.validar();
    if (errores.length) {
      return res.status(400).json({ ok: false, errores });
    }

    // Verificar que el rol existe
    const rol = await Rol.findByPk(dto.id_rol);
    if (!rol) {
      return res.status(404).json({ ok: false, mensaje: 'Rol no encontrado' });
    }

    // TODO: Implementar la lógica de asignación cuando se cree el modelo usuario_rol
    // Ejemplo esperado:
    // await UsuarioRol.create({
    //   id_usuario: req.params.id_usuario,
    //   id_rol: dto.id_rol,
    //   id_especializacion: dto.id_especializacion
    // });

    return res.status(200).json({
      ok: true,
      mensaje: 'Validación exitosa. TODO: Implementar asignación cuando exista el modelo usuario_rol',
      data: {
        id_rol: dto.id_rol,
        id_especializacion: dto.id_especializacion
      }
    });
  } catch (error) {
    console.error('Error en asignarRol:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  asignarRol
};
