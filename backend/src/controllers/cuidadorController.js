const { Router } = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validarId = require('../middlewares/validarId');
const { Usuario, CuidadorPaciente, Rol, UsuarioRol } = require('../models');
const CrearCuidadorDTO = require('../dtos/cuidador/CrearCuidadorDTO');
const ActualizarCuidadorDTO = require('../dtos/cuidador/ActualizarCuidadorDTO');
const CuidadorResponseDTO = require('../dtos/cuidador/CuidadorResponseDTO');
const { ok, created } = require('../views/response');
const { BusinessError, ConflictError, NotFoundError } = require('../errors/AppError');
const enTransaccion = require('../utils/transaccion');

const router = Router();
const r = (handler) => asyncHandler(handler);

// ==========================================
// Orquestación y validación HTTP
// ==========================================

const listarPorPaciente = async (req, res) => {
  const cuidadores = await CuidadorPaciente.findAll({
    where: { id_paciente: req.params.id_paciente, estado: true }
  });
  return ok(res, CuidadorResponseDTO.fromList(cuidadores));
};

const crear = async (req, res) => {
  // DTO de entrada: verifica formato JSON
  const dto = CrearCuidadorDTO.from(req.body);

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

  // DTO de salida: verifica JSON
  return created(res, new CuidadorResponseDTO(relacion), 'Cuidador registrado');
};

const actualizar = async (req, res) => {
  const relacion = await CuidadorPaciente.findByPk(req.params.id);
  if (!relacion) throw new NotFoundError('Relación no encontrada');

  // DTO de entrada: verifica formato JSON
  const dto = ActualizarCuidadorDTO.from(req.body);

  await relacion.update({
    parentesco: dto.parentesco ?? relacion.parentesco,
    estado: dto.estado ?? relacion.estado
  });

  // DTO de salida: verifica JSON
  return ok(res, new CuidadorResponseDTO(relacion), 'Cuidador actualizado');
};

const eliminar = async (req, res) => {
  const relacion = await CuidadorPaciente.findByPk(req.params.id);
  if (!relacion) throw new NotFoundError('Relación no encontrada');

  await relacion.destroy();
  return ok(res, null, 'Cuidador eliminado');
};

// ==========================================
// Endpoints definidos en el Controller
// ==========================================
router.get('/paciente/:id_paciente', validarId('id_paciente'), r(listarPorPaciente));
router.post('/', r(crear));
router.put('/:id', validarId(), r(actualizar));
router.delete('/:id', validarId(), r(eliminar));

module.exports = router;
module.exports.listarPorPaciente = listarPorPaciente;
module.exports.crear = crear;
module.exports.actualizar = actualizar;
module.exports.eliminar = eliminar;
