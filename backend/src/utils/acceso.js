const { CuidadorPaciente, Tratamiento } = require('../models');
const { ForbiddenError, UnauthorizedError } = require('../errors/AppError');

const exigirUsuario = (usuario) => {
  if (!usuario) throw new UnauthorizedError('Debe iniciar sesión');
  return usuario;
};

const esAdmin = (usuario) => usuario.roles.includes('ADMIN');

const exigirPropietario = (usuario, idUsuario) => {
  exigirUsuario(usuario);
  if (!esAdmin(usuario) && Number(usuario.id_usuario) !== Number(idUsuario)) {
    throw new ForbiddenError('No tiene acceso a los datos de este usuario');
  }
};

const exigirAccesoPaciente = async (usuario, idPaciente) => {
  exigirUsuario(usuario);
  if (esAdmin(usuario) || Number(usuario.id_usuario) === Number(idPaciente)) return;
  const cuidador = await CuidadorPaciente.findOne({
    where: { id_paciente: idPaciente, id_cuidador: usuario.id_usuario, estado: true }
  });
  if (cuidador) return;
  const medico = await Tratamiento.findOne({
    where: { id_paciente: idPaciente, id_medico: usuario.id_usuario, estado: true }
  });
  if (!medico) throw new ForbiddenError('No tiene acceso a este paciente');
};

module.exports = { exigirUsuario, exigirPropietario, exigirAccesoPaciente };
