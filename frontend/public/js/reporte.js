/**
 * Reportes de adherencia: genera el reporte, consulta estadísticas y
 * cumplimiento, y permite compartirlo por correo (simulado por el backend).
 */
(async function iniciarReporte() {
  if (!SaludTime.exigirSesion()) return;
  SaludTime.iniciarNavegacion();

  const idUsuario = SaludTime.idUsuario();
  const form = document.getElementById('formReporte');
  const formCompartir = document.getElementById('formCompartir');
  const btnGenerar = document.getElementById('btnGenerar');
  const btnCompartir = document.getElementById('btnCompartir');
  let idReporte = null;

  const hoy = new Date();
  const haceUnaSemana = new Date();
  haceUnaSemana.setDate(hoy.getDate() - 7);

  document.getElementById('fecha_inicio').value = SaludTime.fechaISO(haceUnaSemana);
  document.getElementById('fecha_fin').value = SaludTime.fechaISO(hoy);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    SaludTime.ocultarMensaje('mensaje');

    const fechaInicio = document.getElementById('fecha_inicio').value;
    const fechaFin = document.getElementById('fecha_fin').value;

    if (!fechaInicio || !fechaFin) {
      SaludTime.mostrarMensaje('mensaje', 'Seleccione ambas fechas.', 'error');
      return;
    }
    if (fechaFin < fechaInicio) {
      SaludTime.mostrarMensaje('mensaje', 'La fecha final no puede ser anterior a la inicial.', 'error');
      return;
    }

    btnGenerar.disabled = true;
    btnGenerar.textContent = 'Generando...';

    try {
      const reporte = await SaludTime.api('/reportes', {
        method: 'POST',
        body: { id_usuario: idUsuario, fecha_inicio: fechaInicio, fecha_fin: fechaFin }
      });

      idReporte = reporte.id_reporte;

      const [estadisticas, cumplimiento] = await Promise.all([
        SaludTime.api(`/reportes/${idReporte}/estadisticas`),
        SaludTime.api(`/reportes/${idReporte}/cumplimiento`)
      ]);

      pintarReporte(reporte, estadisticas, cumplimiento);
      SaludTime.mostrarMensaje('mensaje', 'Reporte generado correctamente.', 'success');
    } catch (error) {
      SaludTime.mostrarMensaje('mensaje', error.message, 'error');
    } finally {
      btnGenerar.disabled = false;
      btnGenerar.textContent = 'Generar reporte';
    }
  });

  function pintarReporte(reporte, estadisticas, cumplimiento) {
    document.getElementById('panelResultado').hidden = false;
    document.getElementById('tituloResultado').textContent = `Reporte #${reporte.id_reporte}`;
    document.getElementById('rangoReporte').textContent =
      `${SaludTime.formatearFecha(reporte.fecha_inicio)} → ${SaludTime.formatearFecha(reporte.fecha_fin)}`;

    document.getElementById('repTotal').textContent = reporte.total;
    document.getElementById('repTomadas').textContent = reporte.tomadas;
    document.getElementById('repOmitidas').textContent = reporte.omitidas;
    document.getElementById('repPendientes').textContent = estadisticas.pendientes;

    const adherencia = Number(reporte.adherencia || 0);
    document.getElementById('repAdherencia').textContent = `${adherencia}%`;
    document.getElementById('repBarra').style.width = `${Math.min(adherencia, 100)}%`;
    document.getElementById('repNivel').textContent =
      `${cumplimiento.nivel}: ${cumplimiento.mensaje}`;

    document.getElementById('panelResultado').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  formCompartir.addEventListener('submit', async (e) => {
    e.preventDefault();
    SaludTime.ocultarMensaje('mensaje');

    const correo = document.getElementById('correo_destino').value.trim();
    if (!idReporte) {
      SaludTime.mostrarMensaje('mensaje', 'Primero genere un reporte.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      SaludTime.mostrarMensaje('mensaje', 'Ingrese un correo válido.', 'error');
      return;
    }

    btnCompartir.disabled = true;
    btnCompartir.textContent = 'Enviando...';

    try {
      await SaludTime.api('/reportes/compartir', {
        method: 'POST',
        body: { id_reporte: idReporte, correo_destino: correo }
      });
      SaludTime.mostrarMensaje('mensaje', `Reporte compartido con ${correo}.`, 'success');
      formCompartir.reset();
    } catch (error) {
      SaludTime.mostrarMensaje('mensaje', error.message, 'error');
    } finally {
      btnCompartir.disabled = false;
      btnCompartir.textContent = 'Enviar por correo';
    }
  });
})();
