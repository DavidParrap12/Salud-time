const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const endpoint = require('../http/endpoint');
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

// ==========================================
// Orquestación de los casos de uso
// ==========================================

const registrarPaciente = async ({ body: dto }) => {
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

  return created(new UsuarioResponseDTO(usuario), 'Paciente registrado');
};

const registrarEspecialista = async ({ body: dto }) => {
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

  return created(new UsuarioResponseDTO(usuario), 'Especialista registrado');
};

const login = async ({ body: dto }) => {
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

  return ok(
    new LoginResponseDTO({
      token,
      usuario: new UsuarioResponseDTO(usuario),
      roles
    }),
    'Inicio de sesión exitoso'
  );
};

const recuperarPassword = async ({ body: dto }) => {
  const usuario = await Usuario.findOne({ where: { correo: dto.correo } });
  if (!usuario) throw new NotFoundError('Correo no registrado');

  // Aquí se generaría un token temporal y se enviaría por correo.
  return ok(null, 'Se envió un enlace de recuperación al correo');
};

// ==========================================
// Endpoints definidos en el Controller
// ==========================================
router.post('/registro/paciente', endpoint(registrarPaciente, { body: RegistroPacienteDTO }));
router.post('/registro/especialista', endpoint(registrarEspecialista, { body: RegistroEspecialistaDTO }));
router.post('/login', endpoint(login, { body: LoginDTO }));
router.post('/recuperar-password', endpoint(recuperarPassword, { body: RecuperarPasswordDTO }));

module.exports = router;
module.exports.registrarPaciente = registrarPaciente;
module.exports.registrarEspecialista = registrarEspecialista;
module.exports.login = login;
module.exports.recuperarPassword = recuperarPassword;
