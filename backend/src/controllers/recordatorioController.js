const { Router } = require('express');
const endpoint = require('../http/endpoint');
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

// ==========================================
// Orquestación de los casos de uso
// ==========================================

const listarPorTratamiento = async ({ params }) => {
  const lista = await Recordatorio.findAll({
    where: { id_tratamiento: params.id_tratamiento }
  });
  return ok(RecordatorioResponseDTO.fromList(lista));
};

const crear = async ({ body: dto }) => {
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

  return created(new RecordatorioResponseDTO(recordatorio), 'Recordatorio creado');
};

const actualizar = async ({ params, body: dto }) => {
  const recordatorio = await Recordatorio.findByPk(params.id);
  if (!recordatorio) throw new NotFoundError('Recordatorio no encontrado');

  await recordatorio.update({
    hora: dto.hora ?? recordatorio.hora,
    dias_semana: dto.dias_semana ?? recordatorio.dias_semana,
    fecha_inicio: dto.fecha_inicio ?? recordatorio.fecha_inicio,
    fecha_fin: dto.fecha_fin ?? recordatorio.fecha_fin,
    estado: dto.estado ?? recordatorio.estado
  });

  return ok(new RecordatorioResponseDTO(recordatorio), 'Recordatorio actualizado');
};

const eliminar = async ({ params }) => {
  const recordatorio = await Recordatorio.findByPk(params.id);
  if (!recordatorio) throw new NotFoundError('Recordatorio no encontrado');

  await recordatorio.update({ estado: false });
  return ok(null, 'Recordatorio desactivado');
};

const cambiarHora = async ({ params, body: dto }) => {
  const recordatorio = await Recordatorio.findByPk(params.id);
  if (!recordatorio) throw new NotFoundError('Recordatorio no encontrado');

  await recordatorio.update({ hora: dto.hora });
  return ok(new RecordatorioResponseDTO(recordatorio), 'Hora actualizada');
};

const cambiarDias = async ({ params, body: dto }) => {
  const recordatorio = await Recordatorio.findByPk(params.id);
  if (!recordatorio) throw new NotFoundError('Recordatorio no encontrado');

  await recordatorio.update({ dias_semana: dto.dias_semana });
  return ok(new RecordatorioResponseDTO(recordatorio), 'Días actualizados');
};

const cambiarMedicamento = async () => {
  throw new BusinessError('Para cambiar el medicamento, actualice el tratamiento asociado');
};

// ==========================================
// Endpoints definidos en el Controller
// ==========================================
router.get('/tratamiento/:id_tratamiento', validarId('id_tratamiento'), endpoint(listarPorTratamiento));
router.post('/', endpoint(crear, { body: CrearRecordatorioDTO }));
router.put('/:id', validarId(), endpoint(actualizar, { body: ActualizarRecordatorioDTO }));
router.delete('/:id', validarId(), endpoint(eliminar));
router.patch('/:id/hora', validarId(), endpoint(cambiarHora, { body: CambiarHoraDTO }));
router.patch('/:id/dias', validarId(), endpoint(cambiarDias, { body: CambiarDiasDTO }));
router.patch('/:id/medicamento', validarId(), endpoint(cambiarMedicamento));

module.exports = router;
module.exports.listarPorTratamiento = listarPorTratamiento;
module.exports.crear = crear;
module.exports.actualizar = actualizar;
module.exports.eliminar = eliminar;
module.exports.cambiarHora = cambiarHora;
module.exports.cambiarDias = cambiarDias;
module.exports.cambiarMedicamento = cambiarMedicamento;
