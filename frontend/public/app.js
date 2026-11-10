/**
 * Dashboard principal: consume /api/dashboard/:id_usuario y muestra las
 * dosis del día. Permite confirmar una dosis pendiente.
 */
(async function iniciarDashboard() {
  if (!SaludTime.exigirSesion()) return;
  SaludTime.iniciarNavegacion();

  const idUsuario = SaludTime.idUsuario();
  if (!idUsuario) {
    SaludTime.mostrarMensaje('mensaje', 'No se encontró el usuario de la sesión. Vuelva a iniciar sesión.', 'error');
    return;
  }

  const listaHoy = document.getElementById('listaMedicamentosHoy');
  const listaPendientes = document.getElementById('listaPendientes');
  let contexto = new Map();

  function pintarDosis(dosis, { conBoton = false } = {}) {
    const ctx = contexto.get(dosis.id_recordatorio) || {};
    const nombre = ctx.medicamento?.nombre || 'Medicamento';
    const detalle = [ctx.medicamento?.presentacion, ctx.tratamiento?.dosis]
      .filter(Boolean)
      .join(' — ') || 'Dosis programada';

    const estado = SaludTime.estadoTexto[dosis.estado] || dosis.estado;
    const clase = SaludTime.estadoClase[dosis.estado] || 'status-pending';

    return `
      <div class="med-item">
        <div class="med-icon">
          <span class="material-icons">medication</span>
        </div>
        <div class="med-info">
          <div class="med-name">${SaludTime.escapar(nombre)}</div>
          <div class="med-dose">${SaludTime.escapar(detalle)}</div>
        </div>
        <div class="med-actions">
          <span class="med-time">${SaludTime.formatearHora(dosis.fecha_hora)}</span>
          <span class="reminder-status ${clase}">${SaludTime.escapar(estado)}</span>
          ${
            conBoton && dosis.estado === 'PENDIENTE'
              ? `<button class="btn-small" data-confirmar="${dosis.id_dosis_programada}">Confirmar</button>`
              : ''
          }
        </div>
      </div>
    `;
  }

  function enlazarConfirmaciones() {
    document.querySelectorAll('[data-confirmar]').forEach((boton) => {
      boton.addEventListener('click', async () => {
        boton.disabled = true;
        boton.textContent = 'Guardando...';
        try {
          await SaludTime.api(`/dosis/${boton.dataset.confirmar}/confirmar`, {
            method: 'POST',
            body: { observaciones: 'Confirmada desde el dashboard' }
          });
          SaludTime.mostrarMensaje('mensaje', 'Dosis confirmada correctamente.', 'success');
          await cargar();
        } catch (error) {
          SaludTime.mostrarMensaje('mensaje', error.message, 'error');
          boton.disabled = false;
          boton.textContent = 'Confirmar';
        }
      });
    });
  }

  async function cargar() {
    listaHoy.innerHTML = '<p class="empty-state">Cargando dosis...</p>';
    listaPendientes.innerHTML = '<p class="empty-state">Cargando...</p>';

    const [dashboard, medicamentos, tratamientos] = await Promise.all([
      SaludTime.api(`/dashboard/${idUsuario}`),
      SaludTime.api('/medicamentos'),
      SaludTime.api(`/tratamientos/paciente/${idUsuario}`)
    ]);

    const recordatorios = await Promise.all(
      tratamientos
        .filter((t) => t.estado)
        .map((t) => SaludTime.api(`/recordatorios/tratamiento/${t.id_tratamiento}`))
    );

    const medicamentosPorId = new Map(medicamentos.map((m) => [m.id_medicamento, m]));
    const tratamientosPorId = new Map(tratamientos.map((t) => [t.id_tratamiento, t]));

    contexto = new Map();
    for (const lista of recordatorios) {
      for (const recordatorio of lista) {
        const tratamiento = tratamientosPorId.get(recordatorio.id_tratamiento);
        contexto.set(recordatorio.id_recordatorio, {
          recordatorio,
          tratamiento,
          medicamento: medicamentosPorId.get(tratamiento?.id_medicamento)
        });
      }
    }

    const resumen = dashboard.resumen || {};
    document.getElementById('statMedicamentos').textContent = medicamentos.length;
    document.getElementById('statTomadas').textContent = resumen.tomadas_hoy ?? 0;
    document.getElementById('statPendientes').textContent = resumen.pendientes_hoy ?? 0;
    document.getElementById('statAdherencia').textContent =
      resumen.total_hoy > 0
        ? `${Math.round(((resumen.tomadas_hoy || 0) / resumen.total_hoy) * 100)}%`
        : '0%';

    const hoy = [...(dashboard.medicamentosHoy || [])].sort(
      (a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora)
    );

    listaHoy.innerHTML = hoy.length
      ? hoy.map((d) => pintarDosis(d)).join('')
      : '<p class="empty-state">No hay dosis programadas para hoy.</p>';

    const pendientes = hoy.filter((d) => d.estado === 'PENDIENTE');
    listaPendientes.innerHTML = pendientes.length
      ? pendientes.map((d) => pintarDosis(d, { conBoton: true })).join('')
      : '<p class="empty-state">No quedan dosis pendientes hoy. 🎉</p>';

    enlazarConfirmaciones();
  }

  try {
    await cargar();
  } catch (error) {
    SaludTime.mostrarMensaje('mensaje', error.message, 'error');
    listaHoy.innerHTML = '<p class="empty-state">No se pudieron cargar los datos.</p>';
    listaPendientes.innerHTML = '<p class="empty-state">No se pudieron cargar los datos.</p>';
  }
})();
