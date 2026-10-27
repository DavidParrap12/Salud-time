const { Router } = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validarId = require('../middlewares/validarId');
const { Recordatorio, Tratamiento } = require('../models');
const CrearRecordatorioDTO = require('../dtos/recordatorio/CrearRecordatorioDTO');
const ActualizarRecordatorioDTO = require('../dtos/recordatorio/ActualizarRecordatorioDTO');
const CambiarHoraDTO = require('../dtos/recordatorio/CambiarHoraDTO');
const CambiarDiasDTO = require('../dtos/recordatorio/CambiarDiasDTO');
const RecordatorioResponseDTO = require('../dtos/recordatorio/RecordatorioResponseDTO');
const { ok, created } = require('../views/response');
const { BusinessError, NotFoundError } = require('../errors/AppError');

const router = Router();
const r = (handler) => asyncHandler(handler);

// ==========================================
// Orquestación y validación HTTP
// ==========================================

const listarPorTratamiento = async (req, res) => {
  const lista = await Recordatorio.findAll({
    where: { id_tratamiento: req.params.id_tratamiento }
  });
  return ok(res, RecordatorioResponseDTO.fromList(lista));
};

const crear = async (req, res) => {
  // DTO de entrada: verifica formato JSON
  const dto = CrearRecordatorioDTO.from(req.body);

  const tratamiento = await Tratamiento.findByPk(dto.id_tratamiento);
  if (!tratamiento) throw new NotFoundError('Tratamiento no encontrado');

  const recordatorio = await Recordatorio.create({
    id_tratamiento: dto.id_tratamiento,
    hora: dto.hora,
    dias_semana: dto.dias_semana,
    fecha_inicio: dto.fecha_inicio,
    fecha_fin: dto.fecha_fin,
    estado: true
  });

  // DTO de salida: verifica y da formato al JSON
  return created(res, new RecordatorioResponseDTO(recordatorio), 'Recordatorio creado');
};

const actualizar = async (req, res) => {
  const recordatorio = await Recordatorio.findByPk(req.params.id);
  if (!recordatorio) throw new NotFoundError('Recordatorio no encontrado');

  // DTO de entrada: verifica formato JSON
  const dto = ActualizarRecordatorioDTO.from(req.body);

  await recordatorio.update({
    hora: dto.hora ?? recordatorio.hora,
    dias_semana: dto.dias_semana ?? recordatorio.dias_semana,
    fecha_inicio: dto.fecha_inicio ?? recordatorio.fecha_inicio,
    fecha_fin: dto.fecha_fin ?? recordatorio.fecha_fin,
    estado: dto.estado ?? recordatorio.estado
  });

  // DTO de salida: verifica JSON
  return ok(res, new RecordatorioResponseDTO(recordatorio), 'Recordatorio actualizado');
};

const eliminar = async (req, res) => {
  const recordatorio = await Recordatorio.findByPk(req.params.id);
  if (!recordatorio) throw new NotFoundError('Recordatorio no encontrado');

  await recordatorio.update({ estado: false });
  return ok(res, null, 'Recordatorio desactivado');
};

const cambiarHora = async (req, res) => {
  const recordatorio = await Recordatorio.findByPk(req.params.id);
  if (!recordatorio) throw new NotFoundError('Recordatorio no encontrado');

  // DTO de entrada: verifica formato JSON
  const dto = CambiarHoraDTO.from(req.body);

  await recordatorio.update({ hora: dto.hora });
  return ok(res, new RecordatorioResponseDTO(recordatorio), 'Hora actualizada');
};

const cambiarDias = async (req, res) => {
  const recordatorio = await Recordatorio.findByPk(req.params.id);
  if (!recordatorio) throw new NotFoundError('Recordatorio no encontrado');

  // DTO de entrada: verifica formato JSON
  const dto = CambiarDiasDTO.from(req.body);

  await recordatorio.update({ dias_semana: dto.dias_semana });
  return ok(res, new RecordatorioResponseDTO(recordatorio), 'Días actualizados');
};

const cambiarMedicamento = async () => {
  throw new BusinessError('Para cambiar el medicamento, actualice el tratamiento asociado');
};

// ==========================================
// Endpoints definidos en el Controller
// ==========================================
router.get('/tratamiento/:id_tratamiento', validarId('id_tratamiento'), r(listarPorTratamiento));
router.post('/', r(crear));
router.put('/:id', validarId(), r(actualizar));
router.delete('/:id', validarId(), r(eliminar));
router.patch('/:id/hora', validarId(), r(cambiarHora));
router.patch('/:id/dias', validarId(), r(cambiarDias));
router.patch('/:id/medicamento', validarId(), r(cambiarMedicamento));

module.exports = router;
module.exports.listarPorTratamiento = listarPorTratamiento;
module.exports.crear = crear;
module.exports.actualizar = actualizar;
module.exports.eliminar = eliminar;
module.exports.cambiarHora = cambiarHora;
module.exports.cambiarDias = cambiarDias;
module.exports.cambiarMedicamento = cambiarMedicamento;
