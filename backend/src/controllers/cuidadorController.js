const { Router } = require('express');
const endpoint = require('../http/endpoint');
const validarId = require('../middlewares/validarId');
const { Usuario, CuidadorPaciente, Rol, UsuarioRol } = require('../models');
const CrearCuidadorDTO = require('../dtos/cuidador/CrearCuidadorDTO');
const ActualizarCuidadorDTO = require('../dtos/cuidador/ActualizarCuidadorDTO');
const CuidadorResponseDTO = require('../dtos/cuidador/CuidadorResponseDTO');
const { ok, created } = require('../views/response');
const { BusinessError, ConflictError, NotFoundError } = require('../errors/AppError');
const enTransaccion = require('../utils/transaccion');

const router = Router();

// ==========================================
// Orquestación de los casos de uso
// ==========================================

const listarPorPaciente = async ({ params }) => {
  const cuidadores = await CuidadorPaciente.findAll({
    where: { id_paciente: params.id_paciente, estado: true }
  });
  return ok(CuidadorResponseDTO.fromList(cuidadores));
};

const crear = async ({ body: dto }) => {
  const paciente = await Usuario.findByPk(dto.id_paciente);
  if (!paciente) throw new NotFoundError('Paciente no encontrado');

  const cuidadorUsuario = await Usuario.findOne({ where: { correo: dto.correo_cuidador } });
  if (!cuidadorUsuario) throw new NotFoundError('El cuidador debe estar registrado como usuario');

  if (cuidadorUsuario.id_usuario === paciente.id_usuario) {
    throw new BusinessError('El cuidador no puede ser el mismo paciente');
  }

  const existe = await CuidadorPaciente.findOne({
    where: { id_paciente: dto.id_paciente, id_cuidador: cuidadorUsuario.id_usuario }
  });
  if (existe) throw new ConflictError('Ya existe esa relación');

  const relacion = await enTransaccion(async (transaction) => {
    const creada = await CuidadorPaciente.create({
      id_paciente: dto.id_paciente,
      id_cuidador: cuidadorUsuario.id_usuario,
      parentesco: dto.parentesco,
      estado: true
    }, { transaction });

    const rolCuidador = await Rol.findOne({ where: { nombre: 'CUIDADOR' }, transaction });
    if (rolCuidador) {
      const yaTiene = await UsuarioRol.findOne({
        where: { id_usuario: cuidadorUsuario.id_usuario, id_rol: rolCuidador.id_rol },
        transaction
      });
      if (!yaTiene) {
        await UsuarioRol.create({
          id_usuario: cuidadorUsuario.id_usuario,
          id_rol: rolCuidador.id_rol
        }, { transaction });
      }
    }

    return creada;
  });

  return created(new CuidadorResponseDTO(relacion), 'Cuidador registrado');
};

const actualizar = async ({ body: dto, params }) => {
  const relacion = await CuidadorPaciente.findByPk(params.id);
  if (!relacion) throw new NotFoundError('Relación no encontrada');

  await relacion.update({
    parentesco: dto.parentesco ?? relacion.parentesco,
    estado: dto.estado ?? relacion.estado
  });

  return ok(new CuidadorResponseDTO(relacion), 'Cuidador actualizado');
};

const eliminar = async ({ params }) => {
  const relacion = await CuidadorPaciente.findByPk(params.id);
  if (!relacion) throw new NotFoundError('Relación no encontrada');

  await relacion.destroy();
  return ok(null, 'Cuidador eliminado');
};

// ==========================================
// Endpoints definidos en el Controller
// ==========================================
router.get('/paciente/:id_paciente', validarId('id_paciente'), endpoint(listarPorPaciente));
router.post('/', endpoint(crear, { body: CrearCuidadorDTO }));
router.put('/:id', validarId(), endpoint(actualizar, { body: ActualizarCuidadorDTO }));
router.delete('/:id', validarId(), endpoint(eliminar));

module.exports = router;
module.exports.listarPorPaciente = listarPorPaciente;
module.exports.crear = crear;
module.exports.actualizar = actualizar;
module.exports.eliminar = eliminar;
