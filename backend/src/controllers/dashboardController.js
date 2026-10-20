const { Tratamiento, Recordatorio, DosisProgramada, Usuario } = require('../models');
const DashboardResponseDTO       = require('../dtos/dashboard/DashboardResponseDTO');
const UsuarioResponseDTO         = require('../dtos/usuario/UsuarioResponseDTO');
const DosisProgramadaResponseDTO = require('../dtos/dosis/DosisProgramadaResponseDTO');
const { ok, error }              = require('../views/response');

exports.obtener = async (req, res) => {
  try {
    const idUsuario = req.params.id_usuario;
    const usuario = await Usuario.findByPk(idUsuario);
    if (!usuario) return error(res, 404, 'Usuario no encontrado');

    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0);
    const fin    = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);

    const tratamientos = await Tratamiento.findAll({
      where: { id_paciente: idUsuario, estado: true },
      include: [{ model: Recordatorio, as: 'recordatorios', include: [{ model: DosisProgramada, as: 'dosis' }] }]
    });

    const dosisHoy = [];
    for (const t of tratamientos) {
      for (const r of (t.recordatorios || [])) {
        for (const d of (r.dosis || [])) {
          const f = new Date(d.fecha_hora);
          if (f >= inicio && f <= fin) dosisHoy.push(d);
        }
      }
    }

    const resumen = {
      total_hoy:      dosisHoy.length,
      tomadas_hoy:    dosisHoy.filter(d => d.estado === 'TOMADA').length,
      pendientes_hoy: dosisHoy.filter(d => d.estado === 'PENDIENTE').length,
      omitidas_hoy:   dosisHoy.filter(d => d.estado === 'OMITIDA').length
    };

    return ok(res, new DashboardResponseDTO({
      usuario: new UsuarioResponseDTO(usuario),
      medicamentosHoy: DosisProgramadaResponseDTO.fromList(dosisHoy),
      dosisPendientes: DosisProgramadaResponseDTO.fromList(dosisHoy.filter(d => d.estado === 'PENDIENTE')),
      resumen
    }));
  } catch (e) {
    return error(res, 500, 'Error al obtener dashboard', e.message);
  }
};

exports.medicamentosHoy = async (req, res) => {
  try {
    const idUsuario = req.params.id_usuario;
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0);
    const fin    = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);

    const tratamientos = await Tratamiento.findAll({
      where: { id_paciente: idUsuario, estado: true },
      include: [{ model: Recordatorio, as: 'recordatorios', include: [{ model: DosisProgramada, as: 'dosis' }] }]
    });

    const resultado = [];
    for (const t of tratamientos) {
      for (const r of (t.recordatorios || [])) {
        for (const d of (r.dosis || [])) {
          const f = new Date(d.fecha_hora);
          if (f >= inicio && f <= fin) resultado.push(d);
        }
      }
    }
    return ok(res, DosisProgramadaResponseDTO.fromList(resultado));
  } catch (e) {
    return error(res, 500, 'Error al obtener medicamentos del día', e.message);
  }
};

exports.dosisPendientes = async (req, res) => {
  try {
    const idUsuario = req.params.id_usuario;
    const includeTratamiento = idUsuario ? [{
      model: Recordatorio,
      as: 'recordatorio',
      required: true,
      include: [{
        model: Tratamiento,
        as: 'tratamiento',
        where: { id_paciente: idUsuario, estado: true },
        required: true
      }]
    }] : [];

    const dosis = await DosisProgramada.findAll({
      where: { estado: 'PENDIENTE' },
      include: includeTratamiento
    });
    return ok(res, DosisProgramadaResponseDTO.fromList(dosis));
  } catch (e) {
    return error(res, 500, 'Error al obtener dosis pendientes', e.message);
  }
};
