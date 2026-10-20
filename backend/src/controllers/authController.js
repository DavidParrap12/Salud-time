const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario, Rol, UsuarioRol, Especializacion, MedicoEspecializacion } = require('../models');
const RegistroPacienteDTO     = require('../dtos/auth/RegistroPacienteDTO');
const RegistroEspecialistaDTO = require('../dtos/auth/RegistroEspecialistaDTO');
const LoginDTO                = require('../dtos/auth/LoginDTO');
const RecuperarPasswordDTO    = require('../dtos/auth/RecuperarPasswordDTO');
const UsuarioResponseDTO      = require('../dtos/usuario/UsuarioResponseDTO');
const { created, ok, error }  = require('../views/response');

exports.registrarPaciente = async (req, res) => {
  try {
    const dto = new RegistroPacienteDTO(req.body || {});
    const errores = dto.validar();
    if (errores.length) return error(res, 400, 'Datos inválidos', errores);

    const existe = await Usuario.findOne({ where: { correo: dto.correo } });
    if (existe) return error(res, 409, 'El correo ya está registrado');

    const hash = await bcrypt.hash(dto.contrasena, 10);
    const usuario = await Usuario.create({
      nombre_completo: dto.nombre_completo,
      correo: dto.correo,
      contrasena_hash: hash,
      edad: dto.edad,
      telefono: dto.telefono,
      estado: true,
      correo_verificado: false
    });

    const rolPaciente = await Rol.findOne({ where: { nombre: 'PACIENTE' } });
    if (rolPaciente) {
      await UsuarioRol.create({
        id_usuario: usuario.id_usuario,
        id_rol: rolPaciente.id_rol
      });
    }

    return created(res, new UsuarioResponseDTO(usuario), 'Paciente registrado');
  } catch (e) {
    return error(res, 500, 'Error al registrar paciente', e.message);
  }
};

exports.registrarEspecialista = async (req, res) => {
  try {
    const dto = new RegistroEspecialistaDTO(req.body || {});
    const errores = dto.validar();
    if (errores.length) return error(res, 400, 'Datos inválidos', errores);

    const existe = await Usuario.findOne({ where: { correo: dto.correo } });
    if (existe) return error(res, 409, 'El correo ya está registrado');

    const esp = await Especializacion.findByPk(dto.id_especializacion);
    if (!esp) return error(res, 404, 'Especialización no encontrada');

    const hash = await bcrypt.hash(dto.contrasena, 10);
    const usuario = await Usuario.create({
      nombre_completo: dto.nombre_completo,
      correo: dto.correo,
      contrasena_hash: hash,
      edad: dto.edad,
      telefono: dto.telefono,
      estado: true,
      correo_verificado: false
    });

    const rolMedico = await Rol.findOne({ where: { nombre: 'MEDICO' } });
    if (rolMedico) {
      await UsuarioRol.create({
        id_usuario: usuario.id_usuario,
        id_rol: rolMedico.id_rol
      });
    }

    await MedicoEspecializacion.create({
      id_usuario: usuario.id_usuario,
      id_especializacion: esp.id_especializacion
    });

    return created(res, new UsuarioResponseDTO(usuario), 'Especialista registrado');
  } catch (e) {
    return error(res, 500, 'Error al registrar especialista', e.message);
  }
};

exports.login = async (req, res) => {
  try {
    const dto = new LoginDTO(req.body || {});
    const errores = dto.validar();
    if (errores.length) return error(res, 400, 'Datos inválidos', errores);

    const usuario = await Usuario.findOne({
      where: { correo: dto.correo },
      include: [{ model: Rol, as: 'roles' }]
    });
    if (!usuario) return error(res, 401, 'Credenciales incorrectas');
    if (!usuario.estado) return error(res, 401, 'Cuenta desactivada');

    const valida = await bcrypt.compare(dto.contrasena, usuario.contrasena_hash);
    if (!valida) return error(res, 401, 'Credenciales incorrectas');

    const roles = usuario.roles.map(r => r.nombre);
    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, correo: usuario.correo, roles },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return ok(res, {
      token,
      usuario: new UsuarioResponseDTO(usuario),
      roles
    }, 'Inicio de sesión exitoso');
  } catch (e) {
    return error(res, 500, 'Error al iniciar sesión', e.message);
  }
};

exports.recuperarPassword = async (req, res) => {
  try {
    const dto = new RecuperarPasswordDTO(req.body || {});
    const errores = dto.validar();
    if (errores.length) return error(res, 400, 'Datos inválidos', errores);

    const usuario = await Usuario.findOne({ where: { correo: dto.correo } });
    if (!usuario) return error(res, 404, 'Correo no registrado');

    // Aquí se generaría un token temporal y se enviaría por correo.
    return ok(res, null, 'Se envió un enlace de recuperación al correo');
  } catch (e) {
    return error(res, 500, 'Error al recuperar contraseña', e.message);
  }
};