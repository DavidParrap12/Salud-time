/**
 * Condiciones y reglas de validación para los endpoints de Reportes.
 */
const crearReporteCondiciones = {
  id_usuario: {
    required: true,
    type: 'int',
    min: 1,
    message: 'El usuario es obligatorio'
  },
  fecha_inicio: {
    required: true,
    type: 'date',
    message: 'La fecha de inicio es obligatoria (YYYY-MM-DD)'
  },
  fecha_fin: {
    required: true,
    type: 'date',
    message: 'La fecha de fin es obligatoria (YYYY-MM-DD)'
  }
};

const crearReporteReglaCruzada = (datos) => {
  if (datos.fecha_inicio && datos.fecha_fin && new Date(datos.fecha_fin) < new Date(datos.fecha_inicio)) {
    return ['La fecha fin no puede ser anterior a la fecha inicio'];
  }
  return [];
};

const compartirReporteCondiciones = {
  id_reporte: {
    required: true,
    type: 'int',
    min: 1,
    message: 'El id_reporte es obligatorio'
  },
  correo_destino: {
    required: true,
    type: 'email',
    message: 'El correo destino no es válido'
  }
};

module.exports = {
  crearReporteCondiciones,
  crearReporteReglaCruzada,
  compartirReporteCondiciones
};
