const { Router } = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const validarId = require('../middlewares/validarId');
const { Medicamento } = require('../models');
const CrearMedicamentoDTO = require('../dtos/medicamento/CrearMedicamentoDTO');
const ActualizarMedicamentoDTO = require('../dtos/medicamento/ActualizarMedicamentoDTO');
const MedicamentoResponseDTO = require('../dtos/medicamento/MedicamentoResponseDTO');
const MedicamentoVencimientoResponseDTO = require('../dtos/medicamento/MedicamentoVencimientoResponseDTO');
const { ok, created } = require('../views/response');
const { NotFoundError } = require('../errors/AppError');

const router = Router();
const r = (handler) => asyncHandler(handler);

// ==========================================
// Orquestación y validación HTTP
// ==========================================

const listar = async (req, res) => {
  const medicamentos = await Medicamento.findAll({ where: { estado: true } });
  return ok(res, MedicamentoResponseDTO.fromList(medicamentos));
};

const obtener = async (req, res) => {
  const medicamento = await Medicamento.findByPk(req.params.id);
  if (!medicamento) throw new NotFoundError('Medicamento no encontrado');
  return ok(res, new MedicamentoResponseDTO(medicamento));
};

const crear = async (req, res) => {
  // DTO de entrada: verifica formato JSON del cuerpo
  const dto = CrearMedicamentoDTO.from(req.body);

  const medicamento = await Medicamento.create({
    nombre: dto.nombre,
    presentacion: dto.presentacion,
    descripcion: dto.descripcion,
    fecha_vencimiento: dto.fecha_vencimiento
  });

  // DTO de salida: verifica y da formato al JSON
  return created(res, new MedicamentoResponseDTO(medicamento), 'Medicamento registrado');
};

const actualizar = async (req, res) => {
  const medicamento = await Medicamento.findByPk(req.params.id);
  if (!medicamento) throw new NotFoundError('Medicamento no encontrado');

  // DTO de entrada: verifica formato JSON
  const dto = ActualizarMedicamentoDTO.from(req.body);

  await medicamento.update({
    nombre: dto.nombre ?? medicamento.nombre,
    presentacion: dto.presentacion ?? medicamento.presentacion,
    descripcion: dto.descripcion ?? medicamento.descripcion,
    fecha_vencimiento: dto.fecha_vencimiento ?? medicamento.fecha_vencimiento,
    estado: dto.estado ?? medicamento.estado
  });

  // DTO de salida: verifica y limpia JSON
  return ok(res, new MedicamentoResponseDTO(medicamento), 'Medicamento actualizado');
};

const eliminar = async (req, res) => {
  const medicamento = await Medicamento.findByPk(req.params.id);
  if (!medicamento) throw new NotFoundError('Medicamento no encontrado');

  await medicamento.update({ estado: false });
  return ok(res, null, 'Medicamento desactivado');
};

const validar = async (req, res) => {
  // Verifica formato JSON con DTO sin lanzar excepción
  return ok(res, CrearMedicamentoDTO.validarDatos(req.body));
};

const vencimiento = async (req, res) => {
  const medicamento = await Medicamento.findByPk(req.params.id);
  if (!medicamento) throw new NotFoundError('Medicamento no encontrado');
  return ok(res, new MedicamentoVencimientoResponseDTO(medicamento));
};

// ==========================================
// Endpoints definidos en el Controller
// ==========================================
router.get('/', r(listar));
router.post('/', r(crear));
router.post('/validar', r(validar));
router.get('/:id/vencimiento', validarId(), r(vencimiento));
router.get('/:id', validarId(), r(obtener));
router.put('/:id', validarId(), r(actualizar));
router.delete('/:id', validarId(), r(eliminar));

module.exports = router;
module.exports.listar = listar;
module.exports.obtener = obtener;
module.exports.crear = crear;
module.exports.actualizar = actualizar;
module.exports.eliminar = eliminar;
module.exports.validar = validar;
module.exports.vencimiento = vencimiento;
