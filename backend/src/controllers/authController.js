const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../middlewares/asyncHandler');
const { Usuario, Rol, UsuarioRol, Especializacion, MedicoEspecializacion } = require('../models');
const RegistroPacienteDTO = require('../dtos/auth/RegistroPacienteDTO');
const RegistroEspecialistaDTO = require('../dtos/auth/RegistroEspecialistaDTO');
const LoginDTO = require('../dtos/auth/LoginDTO');
const RecuperarPasswordDTO = require('../dtos/auth/RecuperarPasswordDTO');
const LoginResponseDTO = require('../dtos/auth/LoginResponseDTO');
const UsuarioResponseDTO = require('../dtos/usuario/UsuarioResponseDTO');
const { created, ok } = require('../views/response');
const { ConflictError, NotFoundError, UnauthorizedError } = require('../errors/AppError');
const enTransaccion = require('../utils/transaccion');

const router = Router();
const r = (handler) => asyncHandler(handler);

// ==========================================
// Orquestadores de peticiones HTTP
// ==========================================

const registrarPaciente = async (req, res) => {
  // DTO de entrada: verifica formato JSON
  const dto = RegistroPacienteDTO.from(req.body);

  const existe = await Usuario.findOne({ where: { correo: dto.correo } });
  if (existe) throw new ConflictError('El correo ya está registrado');

  const hash = await bcrypt.hash(dto.contrasena, 10);

  const usuario = await enTransaccion(async (transaction) => {
    const creado = await Usuario.create({
      nombre_completo: dto.nombre_completo,
      correo: dto.correo,
      contrasena_hash: hash,
      edad: dto.edad,
      telefono: dto.telefono,
      estado: true,
      correo_verificado: false
    }, { transaction });

    const rolPaciente = await Rol.findOne({ where: { nombre: 'PACIENTE' }, transaction });
    if (rolPaciente) {
      await UsuarioRol.create({
        id_usuario: creado.id_usuario,
        id_rol: rolPaciente.id_rol
      }, { transaction });
    }

    return creado;
  });

  // DTO de salida: verifica y limpia JSON de salida
  return created(res, new UsuarioResponseDTO(usuario), 'Paciente registrado');
};

const registrarEspecialista = async (req, res) => {
  // DTO de entrada: verifica formato JSON
  const dto = RegistroEspecialistaDTO.from(req.body);

  const existe = await Usuario.findOne({ where: { correo: dto.correo } });
  if (existe) throw new ConflictError('El correo ya está registrado');

  const especializacion = await Especializacion.findByPk(dto.id_especializacion);
  if (!especializacion) throw new NotFoundError('Especialización no encontrada');

  const hash = await bcrypt.hash(dto.contrasena, 10);

  const usuario = await enTransaccion(async (transaction) => {
    const creado = await Usuario.create({
      nombre_completo: dto.nombre_completo,
      correo: dto.correo,
      contrasena_hash: hash,
      edad: dto.edad,
      telefono: dto.telefono,
      estado: true,
      correo_verificado: false
    }, { transaction });

    const rolMedico = await Rol.findOne({ where: { nombre: 'MEDICO' }, transaction });
    if (rolMedico) {
      await UsuarioRol.create({
        id_usuario: creado.id_usuario,
        id_rol: rolMedico.id_rol
      }, { transaction });
    }

    await MedicoEspecializacion.create({
      id_usuario: creado.id_usuario,
      id_especializacion: especializacion.id_especializacion
    }, { transaction });

    return creado;
  });

  // DTO de salida: verifica y limpia JSON de salida
  return created(res, new UsuarioResponseDTO(usuario), 'Especialista registrado');
};

const login = async (req, res) => {
  // DTO de entrada: verifica formato JSON
  const dto = LoginDTO.from(req.body);

  const usuario = await Usuario.findOne({
    where: { correo: dto.correo },
    include: [{ model: Rol, as: 'roles' }]
  });

  if (!usuario) throw new UnauthorizedError('Credenciales incorrectas');
  if (!usuario.estado) throw new UnauthorizedError('Cuenta desactivada');

  const valida = await bcrypt.compare(dto.contrasena, usuario.contrasena_hash);
  if (!valida) throw new UnauthorizedError('Credenciales incorrectas');

  const roles = usuario.roles.map((rol) => rol.nombre);
  const token = jwt.sign(
    { id_usuario: usuario.id_usuario, correo: usuario.correo, roles },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  // DTO de salida: verifica y estructura JSON de salida
  return ok(
    res,
    new LoginResponseDTO({
      token,
      usuario: new UsuarioResponseDTO(usuario),
      roles
    }),
    'Inicio de sesión exitoso'
  );
};

const recuperarPassword = async (req, res) => {
  // DTO de entrada: verifica formato JSON
  const dto = RecuperarPasswordDTO.from(req.body);

  const usuario = await Usuario.findOne({ where: { correo: dto.correo } });
  if (!usuario) throw new NotFoundError('Correo no registrado');

  return ok(res, null, 'Se envió un enlace de recuperación al correo');
};

// ==========================================
// Endpoints definidos en el Controller
// ==========================================
router.post('/registro/paciente', r(registrarPaciente));
router.post('/registro/especialista', r(registrarEspecialista));
router.post('/login', r(login));
router.post('/recuperar-password', r(recuperarPassword));

module.exports = router;
module.exports.registrarPaciente = registrarPaciente;
module.exports.registrarEspecialista = registrarEspecialista;
module.exports.login = login;
module.exports.recuperarPassword = recuperarPassword;
