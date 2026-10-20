const { Tratamiento, Recordatorio, DosisProgramada } = require('../models');
const CalendarioResponseDTO = require('../dtos/calendario/CalendarioResponseDTO');
const DosisProgramadaResponseDTO = require('../dtos/dosis/DosisProgramadaResponseDTO');
const { ok, error }         = require('../views/response');
const { Op } = require('sequelize');

// Fecha local en formato YYYY-MM-DD (evita el desfase de toISOString en zonas UTC-)
const fechaLocal = (valor) => {
  const d = new Date(valor);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

exports.obtener = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { mes, anio } = req.query;

    const mesNum = parseInt(mes, 10);
    const anioNum = parseInt(anio, 10);
    if (!mesNum || !anioNum || mesNum < 1 || mesNum > 12) {
      return error(res, 400, 'Mes y año válidos son requeridos en la consulta (?mes=X&anio=Y)');
    }

    const inicio = new Date(anioNum, mesNum - 1, 1);
    const fin    = new Date(anioNum, mesNum, 0, 23, 59, 59);

    const tratamientos = await Tratamiento.findAll({
      where: { id_paciente: id_usuario, estado: true },
      include: [{
        model: Recordatorio, as: 'recordatorios',
        include: [{ model: DosisProgramada, as: 'dosis', where: { fecha_hora: { [Op.between]: [inicio, fin] } }, required: false }]
      }]
    });

    const dias = {};
    for (const t of tratamientos) {
      for (const r of (t.recordatorios || [])) {
        for (const d of (r.dosis || [])) {
          const fecha = fechaLocal(d.fecha_hora);
          if (!dias[fecha]) dias[fecha] = { fecha, tomadas: 0, omitidas: 0, total: 0 };
          dias[fecha].total++;
          if (d.estado === 'TOMADA') dias[fecha].tomadas++;
          if (d.estado === 'OMITIDA') dias[fecha].omitidas++;
        }
      }
    }

    return ok(res, new CalendarioResponseDTO({
      mes: mesNum, anio: anioNum, dias: Object.values(dias)
    }));
  } catch (e) {
    return error(res, 500, 'Error al obtener calendario', e.message);
  }
};

exports.porFecha = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { fecha } = req.query;
    const partes = String(fecha).split('-').map(Number);
    if (partes.length !== 3 || partes.some(n => isNaN(n))) {
      return error(res, 400, 'Parámetro de fecha válido requerido (?fecha=YYYY-MM-DD)');
    }

    const [anio, mes, diaNum] = partes;
    const inicio = new Date(anio, mes - 1, diaNum, 0, 0, 0);
    const fin    = new Date(anio, mes - 1, diaNum, 23, 59, 59);

    const tratamientos = await Tratamiento.findAll({
      where: { id_paciente: id_usuario, estado: true },
      include: [{
        model: Recordatorio, as: 'recordatorios',
        include: [{ model: DosisProgramada, as: 'dosis', where: { fecha_hora: { [Op.between]: [inicio, fin] } }, required: false }]
      }]
    });

    const resultado = [];
    for (const t of tratamientos)
      for (const r of (t.recordatorios || []))
        for (const d of (r.dosis || [])) resultado.push(d);

    return ok(res, DosisProgramadaResponseDTO.fromList(resultado));
  } catch (e) {
    return error(res, 500, 'Error al consultar por fecha', e.message);
  }
};

exports.tomadas = async (req, res) => {
  try {
    const idUsuario = req.params.id_usuario || req.query.id_usuario;
    const includeTratamiento = idUsuario ? [{
      model: Recordatorio,
      as: 'recordatorio',
      required: true,
      include: [{
        model: Tratamiento,
        as: 'tratamiento',
        where: { id_paciente: idUsuario },
        required: true
      }]
    }] : [];

    const dosis = await DosisProgramada.findAll({
      where: { estado: 'TOMADA' },
      include: includeTratamiento
    });
    return ok(res, DosisProgramadaResponseDTO.fromList(dosis));
  } catch (e) {
    return error(res, 500, 'Error al listar tomadas', e.message);
  }
};

exports.omitidas = async (req, res) => {
  try {
    const idUsuario = req.params.id_usuario || req.query.id_usuario;
    const includeTratamiento = idUsuario ? [{
      model: Recordatorio,
      as: 'recordatorio',
      required: true,
      include: [{
        model: Tratamiento,
        as: 'tratamiento',
        where: { id_paciente: idUsuario },
        required: true
      }]
    }] : [];

    const dosis = await DosisProgramada.findAll({
      where: { estado: 'OMITIDA' },
      include: includeTratamiento
    });
    return ok(res, DosisProgramadaResponseDTO.fromList(dosis));
  } catch (e) {
    return error(res, 500, 'Error al listar omitidas', e.message);
  }
};

exports.historial = async (req, res) => {
  try {
    const idUsuario = req.params.id_usuario || req.query.id_usuario;
    const includeTratamiento = idUsuario ? [{
      model: Recordatorio,
      as: 'recordatorio',
      required: true,
      include: [{
        model: Tratamiento,
        as: 'tratamiento',
        where: { id_paciente: idUsuario },
        required: true
      }]
    }] : [];

    const dosis = await DosisProgramada.findAll({
      include: includeTratamiento,
      order: [['fecha_hora', 'DESC']]
    });
    return ok(res, DosisProgramadaResponseDTO.fromList(dosis));
  } catch (e) {
    return error(res, 500, 'Error al obtener historial', e.message);
  }
};
