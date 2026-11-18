/**
 * Reportes de adherencia: genera, lista y vuelve a consultar los reportes
 * guardados en PostgreSQL.
 */
(async function iniciarReporte() {
  if (!SaludTime.exigirSesion()) return;
  SaludTime.iniciarNavegacion();

  const idUsuario = SaludTime.idUsuario();
  const form = document.getElementById('formReporte');
  const btnGenerar = document.getElementById('btnGenerar');
  const listaReportes = document.getElementById('listaReportes');

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

      const [estadisticas, cumplimiento] = await Promise.all([
        SaludTime.api(`/reportes/${reporte.id_reporte}/estadisticas`),
        SaludTime.api(`/reportes/${reporte.id_reporte}/cumplimiento`)
      ]);

      pintarReporte(reporte, estadisticas, cumplimiento, true);
      SaludTime.mostrarMensaje('mensaje', 'Reporte generado correctamente.', 'success');
      try {
        await cargarHistorial();
      } catch (error) {
        listaReportes.innerHTML = '<p class="empty-state">No se pudo actualizar el historial. Recarga la página para consultarlo.</p>';
      }
    } catch (error) {
      SaludTime.mostrarMensaje('mensaje', error.message, 'error');
    } finally {
      btnGenerar.disabled = false;
      btnGenerar.textContent = 'Generar reporte';
    }
  });

  function pintarReporte(reporte, estadisticas, cumplimiento, desplazar = false) {
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

    if (desplazar) {
      document.getElementById('panelResultado').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  async function mostrarGuardado(id) {
    const [reporte, estadisticas, cumplimiento] = await Promise.all([
      SaludTime.api(`/reportes/${id}`),
      SaludTime.api(`/reportes/${id}/estadisticas`),
      SaludTime.api(`/reportes/${id}/cumplimiento`)
    ]);
    pintarReporte(reporte, estadisticas, cumplimiento, true);
  }

  async function cargarHistorial() {
    const reportes = await SaludTime.api(`/reportes/usuario/${idUsuario}`);
    listaReportes.innerHTML = reportes.length
      ? reportes.map((reporte) => `
          <button type="button" class="report-history-item" data-reporte="${Number(reporte.id_reporte)}">
            <strong>Reporte #${Number(reporte.id_reporte)}</strong>
            <span>${SaludTime.formatearFecha(reporte.fecha_inicio)} → ${SaludTime.formatearFecha(reporte.fecha_fin)}</span>
            <span>${Number(reporte.adherencia)}% de adherencia</span>
          </button>
        `).join('')
      : '<p class="empty-state">Aún no hay reportes guardados.</p>';
    listaReportes.querySelectorAll('[data-reporte]').forEach((boton) => {
      boton.addEventListener('click', () => mostrarGuardado(boton.dataset.reporte)
        .catch((error) => SaludTime.mostrarMensaje('mensaje', error.message)));
    });
  }

  try {
    await cargarHistorial();
  } catch (error) {
    listaReportes.innerHTML = '<p class="empty-state">No se pudieron cargar los reportes.</p>';
    SaludTime.mostrarMensaje('mensaje', error.message);
  }
})();
