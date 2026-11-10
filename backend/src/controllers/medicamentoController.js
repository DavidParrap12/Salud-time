const { Router } = require('express');
const endpoint = require('../http/endpoint');
const validarId = require('../middlewares/validarId');
const { Medicamento } = require('../models');
const CrearMedicamentoDTO = require('../dtos/medicamento/CrearMedicamentoDTO');
const ActualizarMedicamentoDTO = require('../dtos/medicamento/ActualizarMedicamentoDTO');
const MedicamentoResponseDTO = require('../dtos/medicamento/MedicamentoResponseDTO');
const MedicamentoVencimientoResponseDTO = require('../dtos/medicamento/MedicamentoVencimientoResponseDTO');
const { ok, created } = require('../views/response');
const { NotFoundError } = require('../errors/AppError');

const router = Router();

// ==========================================
// Orquestación de los casos de uso
// ==========================================

const listar = async () => {
  const medicamentos = await Medicamento.findAll({ where: { estado: true } });
  return ok(MedicamentoResponseDTO.fromList(medicamentos));
};

const obtener = async ({ params }) => {
  const medicamento = await Medicamento.findByPk(params.id);
  if (!medicamento) throw new NotFoundError('Medicamento no encontrado');
  return ok(new MedicamentoResponseDTO(medicamento));
};

const crear = async ({ body: dto }) => {
  const medicamento = await Medicamento.create({
    nombre: dto.nombre,
    presentacion: dto.presentacion,
    descripcion: dto.descripcion,
    fecha_vencimiento: dto.fecha_vencimiento
  });

  return created(new MedicamentoResponseDTO(medicamento), 'Medicamento registrado');
};

const actualizar = async ({ body: dto, params }) => {
  const medicamento = await Medicamento.findByPk(params.id);
  if (!medicamento) throw new NotFoundError('Medicamento no encontrado');

  await medicamento.update({
    nombre: dto.nombre ?? medicamento.nombre,
    presentacion: dto.presentacion ?? medicamento.presentacion,
    descripcion: dto.descripcion ?? medicamento.descripcion,
    fecha_vencimiento: dto.fecha_vencimiento ?? medicamento.fecha_vencimiento,
    estado: dto.estado ?? medicamento.estado
  });

  return ok(new MedicamentoResponseDTO(medicamento), 'Medicamento actualizado');
};

const eliminar = async ({ params }) => {
  const medicamento = await Medicamento.findByPk(params.id);
  if (!medicamento) throw new NotFoundError('Medicamento no encontrado');

  await medicamento.update({ estado: false });
  return ok(null, 'Medicamento desactivado');
};

const validar = async ({ body }) => {
  return ok(CrearMedicamentoDTO.validarDatos(body), 'Validación completada');
};

const vencimiento = async ({ params }) => {
  const medicamento = await Medicamento.findByPk(params.id);
  if (!medicamento) throw new NotFoundError('Medicamento no encontrado');
  return ok(new MedicamentoVencimientoResponseDTO(medicamento));
};

// ==========================================
// Endpoints definidos en el Controller
// ==========================================
router.get('/', endpoint(listar));
router.post('/', endpoint(crear, { body: CrearMedicamentoDTO }));
router.post('/validar', endpoint(validar));
router.get('/:id/vencimiento', validarId(), endpoint(vencimiento));
router.get('/:id', validarId(), endpoint(obtener));
router.put('/:id', validarId(), endpoint(actualizar, { body: ActualizarMedicamentoDTO }));
router.delete('/:id', validarId(), endpoint(eliminar));

module.exports = router;
module.exports.listar = listar;
module.exports.obtener = obtener;
module.exports.crear = crear;
module.exports.actualizar = actualizar;
module.exports.eliminar = eliminar;
module.exports.validar = validar;
module.exports.vencimiento = vencimiento;
