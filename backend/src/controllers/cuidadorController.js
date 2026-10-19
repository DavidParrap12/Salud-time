const { Usuario, CuidadorPaciente, Rol, UsuarioRol } = require('../models');
const CrearCuidadorDTO      = require('../dtos/cuidador/CrearCuidadorDTO');
const ActualizarCuidadorDTO = require('../dtos/cuidador/ActualizarCuidadorDTO');
const CuidadorResponseDTO   = require('../dtos/cuidador/CuidadorResponseDTO');
const { ok, created, error } = require('../views/response');

exports.listarPorPaciente = async (req, res) => {
  try {
    const cuidadores = await CuidadorPaciente.findAll({
      where: { id_paciente: req.params.id_paciente, estado: true }
    });
    return ok(res, CuidadorResponseDTO.fromList(cuidadores));
  } catch (e) {
    return error(res, 500, 'Error al listar cuidadores', e.message);
  }
};

exports.crear = async (req, res) => {
  try {
    const dto = new CrearCuidadorDTO(req.body);
    const errores = dto.validar();
    if (errores.length) return error(res, 400, 'Datos inválidos', errores);

    const paciente = await Usuario.findByPk(dto.id_paciente);
    if (!paciente) return error(res, 404, 'Paciente no encontrado');

    const cuidadorUsuario = await Usuario.findOne({ where: { correo: dto.correo_cuidador } });
    if (!cuidadorUsuario) return error(res, 404, 'El cuidador debe estar registrado como usuario');

    if (cuidadorUsuario.id_usuario === paciente.id_usuario)
      return error(res, 400, 'El cuidador no puede ser el mismo paciente');

    const existe = await CuidadorPaciente.findOne({
      where: { id_paciente: dto.id_paciente, id_cuidador: cuidadorUsuario.id_usuario }
    });
    if (existe) return error(res, 409, 'Ya existe esa relación');

    const relacion = await CuidadorPaciente.create({
      id_paciente: dto.id_paciente,
      id_cuidador: cuidadorUsuario.id_usuario,
      parentesco: dto.parentesco,
      estado: true
    });

    const rolCuidador = await Rol.findOne({ where: { nombre: 'CUIDADOR' } });
    if (rolCuidador) {
      const yaTiene = await UsuarioRol.findOne({
        where: { id_usuario: cuidadorUsuario.id_usuario, id_rol: rolCuidador.id_rol }
      });
      if (!yaTiene) {
        await UsuarioRol.create({
          id_usuario: cuidadorUsuario.id_usuario,
          id_rol: rolCuidador.id_rol
        });
      }
    }

    return created(res, new CuidadorResponseDTO(relacion), 'Cuidador registrado');
  } catch (e) {
    return error(res, 500, 'Error al registrar cuidador', e.message);
  }
};

exports.actualizar = async (req, res) => {
  try {
    const rel = await CuidadorPaciente.findByPk(req.params.id);
    if (!rel) return error(res, 404, 'Relación no encontrada');

    const dto = new ActualizarCuidadorDTO(req.body);
    const errores = dto.validar();
    if (errores.length) return error(res, 400, 'Datos inválidos', errores);

    await rel.update({
      parentesco: dto.parentesco ?? rel.parentesco,
      estado:     dto.estado     ?? rel.estado
    });

    return ok(res, new CuidadorResponseDTO(rel), 'Cuidador actualizado');
  } catch (e) {
    return error(res, 500, 'Error al actualizar cuidador', e.message);
  }
};

exports.eliminar = async (req, res) => {
  try {
    const rel = await CuidadorPaciente.findByPk(req.params.id);
    if (!rel) return error(res, 404, 'Relación no encontrada');
    await rel.destroy();
    return ok(res, null, 'Cuidador eliminado');
  } catch (e) {
    return error(res, 500, 'Error al eliminar cuidador', e.message);
  }
};