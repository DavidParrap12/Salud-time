const { Router } = require('express');
const endpoint = require('../http/endpoint');
const validarId = require('../middlewares/validarId');
const { Tratamiento, Usuario, Medicamento } = require('../models');
const CrearTratamientoDTO = require('../dtos/tratamiento/CrearTratamientoDTO');
const ActualizarTratamientoDTO = require('../dtos/tratamiento/ActualizarTratamientoDTO');
const TratamientoResponseDTO = require('../dtos/tratamiento/TratamientoResponseDTO');
const { ok, created } = require('../views/response');
const { NotFoundError } = require('../errors/AppError');

const router = Router();

// ==========================================
// Orquestación de los casos de uso
// ==========================================

const listarPorPaciente = async ({ params }) => {
  const tratamientos = await Tratamiento.findAll({
    where: { id_paciente: params.id_paciente }
  });
  return ok(TratamientoResponseDTO.fromList(tratamientos));
};

const obtener = async ({ params }) => {
  const tratamiento = await Tratamiento.findByPk(params.id);
  if (!tratamiento) throw new NotFoundError('Tratamiento no encontrado');
  return ok(new TratamientoResponseDTO(tratamiento));
};

const crear = async ({ body: dto }) => {
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

  return created(new TratamientoResponseDTO(tratamiento), 'Tratamiento creado');
};

const actualizar = async ({ params, body: dto }) => {
  const tratamiento = await Tratamiento.findByPk(params.id);
  if (!tratamiento) throw new NotFoundError('Tratamiento no encontrado');

  await tratamiento.update({
    dosis: dto.dosis ?? tratamiento.dosis,
    fecha_inicio: dto.fecha_inicio ?? tratamiento.fecha_inicio,
    fecha_fin: dto.fecha_fin ?? tratamiento.fecha_fin,
    estado: dto.estado ?? tratamiento.estado
  });

  return ok(new TratamientoResponseDTO(tratamiento), 'Tratamiento actualizado');
};

const desactivar = async ({ params }) => {
  const tratamiento = await Tratamiento.findByPk(params.id);
  if (!tratamiento) throw new NotFoundError('Tratamiento no encontrado');

  await tratamiento.update({ estado: false });
  return ok(null, 'Tratamiento desactivado');
};

// ==========================================
// Endpoints definidos en el Controller
// ==========================================
router.get('/paciente/:id_paciente', validarId('id_paciente'), endpoint(listarPorPaciente));
router.post('/', endpoint(crear, { body: CrearTratamientoDTO }));
router.get('/:id', validarId(), endpoint(obtener));
router.put('/:id', validarId(), endpoint(actualizar, { body: ActualizarTratamientoDTO }));
router.delete('/:id', validarId(), endpoint(desactivar));

module.exports = router;
module.exports.listarPorPaciente = listarPorPaciente;
module.exports.obtener = obtener;
module.exports.crear = crear;
module.exports.actualizar = actualizar;
module.exports.desactivar = desactivar;
