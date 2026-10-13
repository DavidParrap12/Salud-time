const sequelize = require('../config/database');
const Usuario = require('../models/Usuario');
const MedicoEspecializacion = require('../src/models/medico_especialista');

// DTOs de entrada
const LoginDTO = require('../dtos/auth/LoginDTO');
const RecuperarPasswordDTO = require('../dtos/auth/RecuperarPasswordDTO');
const RegistroPacienteDTO = require('../dtos/auth/RegistroPacienteDTO');
const RegistroEspecialistaDTO = require('../dtos/auth/RegistroEspecialistaDTO');

// DTO de respuesta
const UsuarioResponseDTO = require('../dtos/usuario/UsuarioResponseDTO');

// ──────────────────────────────────────────────
// Registro de paciente
// ──────────────────────────────────────────────
const registroPaciente = async (req, res) => {
  try {
    const dto = new RegistroPacienteDTO(req.body);
    const errores = dto.validar();
    if (errores.length) {
      return res.status(400).json({ ok: false, errores });
    }

    // Verificar si el correo ya está registrado
    const existente = await Usuario.findOne({ where: { correo: dto.correo } });
    if (existente) {
      return res.status(400).json({ ok: false, mensaje: 'El correo ya está registrado' });
    }

    // TODO: Hashear la contraseña con bcrypt antes de guardar
    const usuario = await Usuario.create({
      nombre_completo: dto.nombre_completo,
      correo: dto.correo,
      contrasena_hash: dto.contrasena, // TODO: usar bcrypt.hashSync(dto.contrasena, 10)
      edad: dto.edad,
      telefono: dto.telefono
    });

    return res.status(201).json({
      ok: true,
      mensaje: 'Paciente registrado exitosamente',
      data: new UsuarioResponseDTO(usuario)
    });
  } catch (error) {
    console.error('Error en registroPaciente:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// Registro de especialista (con transacción)
// ──────────────────────────────────────────────
const registroEspecialista = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const dto = new RegistroEspecialistaDTO(req.body);
    const errores = dto.validar();
    if (errores.length) {
      await t.rollback();
      return res.status(400).json({ ok: false, errores });
    }

    // Verificar si el correo ya está registrado
    const existente = await Usuario.findOne({ where: { correo: dto.correo } });
    if (existente) {
      await t.rollback();
      return res.status(400).json({ ok: false, mensaje: 'El correo ya está registrado' });
    }

    // TODO: Hashear la contraseña con bcrypt antes de guardar
    const usuario = await Usuario.create({
      nombre_completo: dto.nombre_completo,
      correo: dto.correo,
      contrasena_hash: dto.contrasena, // TODO: usar bcrypt.hashSync(dto.contrasena, 10)
      edad: dto.edad,
      telefono: dto.telefono
    }, { transaction: t });

    // Crear relación médico-especialización
    await MedicoEspecializacion.create({
      id_usuario: usuario.id_usuario,
      id_especializacion: dto.id_especializacion
    }, { transaction: t });

    await t.commit();

    return res.status(201).json({
      ok: true,
      mensaje: 'Especialista registrado exitosamente',
      data: new UsuarioResponseDTO(usuario)
    });
  } catch (error) {
    await t.rollback();
    console.error('Error en registroEspecialista:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// Inicio de sesión
// ──────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const dto = new LoginDTO(req.body);
    const errores = dto.validar();
    if (errores.length) {
      return res.status(400).json({ ok: false, errores });
    }

    const usuario = await Usuario.findOne({ where: { correo: dto.correo } });
    if (!usuario) {
      return res.status(404).json({ ok: false, mensaje: 'Credenciales incorrectas' });
    }

    // Verificar que la cuenta esté activa
    if (!usuario.estado) {
      return res.status(403).json({ ok: false, mensaje: 'La cuenta está desactivada' });
    }

    // TODO: Comparar contraseña con bcrypt.compareSync(dto.contrasena, usuario.contrasena_hash)
    if (dto.contrasena !== usuario.contrasena_hash) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas' });
    }

    // TODO: Generar token JWT con jsonwebtoken
    // const token = jwt.sign({ id_usuario: usuario.id_usuario }, process.env.JWT_SECRET, { expiresIn: '24h' });

    return res.status(200).json({
      ok: true,
      mensaje: 'Inicio de sesión exitoso',
      data: new UsuarioResponseDTO(usuario)
      // TODO: agregar token en la respuesta
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// Recuperar contraseña
// ──────────────────────────────────────────────
const recuperarPassword = async (req, res) => {
  try {
    const dto = new RecuperarPasswordDTO(req.body);
    const errores = dto.validar();
    if (errores.length) {
      return res.status(400).json({ ok: false, errores });
    }

    const usuario = await Usuario.findOne({ where: { correo: dto.correo } });
    if (!usuario) {
      // Por seguridad, no revelamos si el correo existe o no
      return res.status(200).json({
        ok: true,
        mensaje: 'Si el correo está registrado, recibirás un enlace de recuperación'
      });
    }

    // TODO: Generar token de recuperación y enviar email
    // TODO: Guardar token de recuperación en la base de datos con fecha de expiración

    return res.status(200).json({
      ok: true,
      mensaje: 'Si el correo está registrado, recibirás un enlace de recuperación'
    });
  } catch (error) {
    console.error('Error en recuperarPassword:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
  }
};

module.exports = {
  registroPaciente,
  registroEspecialista,
  login,
  recuperarPassword
};
