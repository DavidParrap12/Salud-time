const Usuario = require('../models/usuario');

// DTOs
const ActualizarUsuarioDTO = require('../dtos/usuario/ActualizarUsuarioDTO');
const UsuarioResponseDTO = require('../dtos/usuario/UsuarioResponseDTO');

// ──────────────────────────────────────────────
// Obtener todos los usuarios activos
// ──────────────────────────────────────────────
const obtenerTodos = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({ where: { estado: true } });
    return res.status(200).json({
      ok: true,
      data: UsuarioResponseDTO.fromList(usuarios)
    });
  } catch (error) {
    console.error('Error en obtenerTodos:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// Obtener usuario por ID
// ──────────────────────────────────────────────
const obtenerPorId = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    }

    return res.status(200).json({
      ok: true,
      data: new UsuarioResponseDTO(usuario)
    });
  } catch (error) {
    console.error('Error en obtenerPorId:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// Actualizar usuario (actualización parcial)
// ──────────────────────────────────────────────
const actualizar = async (req, res) => {
  try {
    const dto = new ActualizarUsuarioDTO(req.body);
    const errores = dto.validar();
    if (errores.length) {
      return res.status(400).json({ ok: false, errores });
    }

    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    }

    // Filtrar solo los campos definidos para actualización parcial
    const camposActualizar = {};
    if (dto.nombre_completo !== undefined) camposActualizar.nombre_completo = dto.nombre_completo;
    if (dto.telefono !== undefined) camposActualizar.telefono = dto.telefono;
    if (dto.edad !== undefined) camposActualizar.edad = dto.edad;

    await usuario.update(camposActualizar);

    return res.status(200).json({
      ok: true,
      mensaje: 'Usuario actualizado exitosamente',
      data: new UsuarioResponseDTO(usuario)
    });
  } catch (error) {
    console.error('Error en actualizar:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// Desactivar usuario (soft delete)
// ──────────────────────────────────────────────
const desactivar = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    }

    await usuario.update({ estado: false });

    return res.status(200).json({
      ok: true,
      mensaje: 'Usuario desactivado exitosamente'
    });
  } catch (error) {
    console.error('Error en desactivar:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// Activar usuario
// ──────────────────────────────────────────────
const activar = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    }

    await usuario.update({ estado: true });

    return res.status(200).json({
      ok: true,
      mensaje: 'Usuario activado exitosamente'
    });
  } catch (error) {
    console.error('Error en activar:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  actualizar,
  desactivar,
  activar
};
