const { Router } = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validarId = require('../middlewares/validarId');
const { Tratamiento, Usuario, Medicamento } = require('../models');
const CrearTratamientoDTO = require('../dtos/tratamiento/CrearTratamientoDTO');
const ActualizarTratamientoDTO = require('../dtos/tratamiento/ActualizarTratamientoDTO');
const TratamientoResponseDTO = require('../dtos/tratamiento/TratamientoResponseDTO');
const { ok, created } = require('../views/response');
const { NotFoundError } = require('../errors/AppError');

const router = Router();
const r = (handler) => asyncHandler(handler);

// ==========================================
// Orquestación y validación HTTP
// ==========================================

const listarPorPaciente = async (req, res) => {
  const tratamientos = await Tratamiento.findAll({
    where: { id_paciente: req.params.id_paciente }
  });
  return ok(res, TratamientoResponseDTO.fromList(tratamientos));
};

const obtener = async (req, res) => {
  const tratamiento = await Tratamiento.findByPk(req.params.id);
  if (!tratamiento) throw new NotFoundError('Tratamiento no encontrado');
  return ok(res, new TratamientoResponseDTO(tratamiento));
};

const crear = async (req, res) => {
  // DTO de entrada: verifica formato JSON
  const dto = CrearTratamientoDTO.from(req.body);

  const paciente = await Usuario.findByPk(dto.id_paciente);
  if (!paciente) throw new NotFoundError('Paciente no encontrado');

  const medicamento = await Medicamento.findByPk(dto.id_medicamento);
  if (!medicamento) throw new NotFoundError('Medicamento no encontrado');

  const tratamiento = await Tratamiento.create({
    id_paciente: dto.id_paciente,
    id_medicamento: dto.id_medicamento,
    id_medico: dto.id_medico,
    dosis: dto.dosis,
    fecha_inicio: dto.fecha_inicio,
    fecha_fin: dto.fecha_fin,
    estado: true
  });

  // DTO de salida: verifica y da formato al JSON
  return created(res, new TratamientoResponseDTO(tratamiento), 'Tratamiento creado');
};

const actualizar = async (req, res) => {
  const tratamiento = await Tratamiento.findByPk(req.params.id);
  if (!tratamiento) throw new NotFoundError('Tratamiento no encontrado');

  // DTO de entrada: verifica formato JSON
  const dto = ActualizarTratamientoDTO.from(req.body);

  await tratamiento.update({
    dosis: dto.dosis ?? tratamiento.dosis,
    fecha_inicio: dto.fecha_inicio ?? tratamiento.fecha_inicio,
    fecha_fin: dto.fecha_fin ?? tratamiento.fecha_fin,
    estado: dto.estado ?? tratamiento.estado
  });

  // DTO de salida: verifica JSON
  return ok(res, new TratamientoResponseDTO(tratamiento), 'Tratamiento actualizado');
};

const desactivar = async (req, res) => {
  const tratamiento = await Tratamiento.findByPk(req.params.id);
  if (!tratamiento) throw new NotFoundError('Tratamiento no encontrado');

  await tratamiento.update({ estado: false });
  return ok(res, null, 'Tratamiento desactivado');
};

// ==========================================
// Endpoints definidos en el Controller
// ==========================================
router.get('/paciente/:id_paciente', validarId('id_paciente'), r(listarPorPaciente));
router.post('/', r(crear));
router.get('/:id', validarId(), r(obtener));
router.put('/:id', validarId(), r(actualizar));
router.delete('/:id', validarId(), r(desactivar));

module.exports = router;
module.exports.listarPorPaciente = listarPorPaciente;
module.exports.obtener = obtener;
module.exports.crear = crear;
module.exports.actualizar = actualizar;
module.exports.desactivar = desactivar;
