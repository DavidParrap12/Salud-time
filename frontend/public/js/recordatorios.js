/**
 * Recordatorios: lista los tratamientos del paciente, permite crear
 * recordatorios y desactivarlos.
 */
(async function iniciarRecordatorios() {
  if (!SaludTime.exigirSesion()) return;
  SaludTime.iniciarNavegacion();

  const idUsuario = SaludTime.idUsuario();
  const form = document.getElementById('formRecordatorio');
  const selectTratamiento = document.getElementById('tratamiento');
  const tabla = document.getElementById('tablaRecordatorios');
  const contador = document.getElementById('contadorRecordatorios');
  const btnGuardar = document.getElementById('btnGuardar');

  let tratamientos = [];
  let medicamentosPorId = new Map();
  let recordatorios = [];

  document.getElementById('fecha_inicio').value = SaludTime.fechaISO();

  function diasSeleccionados() {
    return [...document.querySelectorAll('#diasSemana input:checked')].map((i) => i.value);
  }

  function etiquetaTratamiento(tratamiento) {
    const medicamento = medicamentosPorId.get(tratamiento.id_medicamento);
    const nombre = medicamento?.nombre || `Medicamento #${tratamiento.id_medicamento}`;
    return `${nombre} — ${tratamiento.dosis}`;
  }

  function etiquetaDias(valor) {
    const dias = String(valor || '').split(',').filter(Boolean);
    if (dias.length === 7) return 'Todos los días';
    return dias.map((dia) => ({ LUN: 'Lun', MAR: 'Mar', MIE: 'Mié', JUE: 'Jue', VIE: 'Vie', SAB: 'Sáb', DOM: 'Dom' })[dia] || dia).join(', ');
  }

  function fila(item) {
    const tratamiento = tratamientos.find((t) => t.id_tratamiento === item.id_tratamiento);
    const etiqueta = tratamiento
      ? etiquetaTratamiento(tratamiento)
      : `Tratamiento #${item.id_tratamiento}`;

    return `
      <tr>
        <td>
          <strong>${SaludTime.escapar(etiqueta)}</strong>
        </td>
        <td><span class="badge badge-ok">${SaludTime.formatearHora(item.hora)}</span><br><span class="muted small">${SaludTime.escapar(etiquetaDias(item.dias_semana))}</span></td>
        <td class="small">
          ${SaludTime.formatearFecha(item.fecha_inicio)}
          ${item.fecha_fin ? ` → ${SaludTime.formatearFecha(item.fecha_fin)}` : ''}
        </td>
        <td class="acciones">
          <button class="btn-small btn-danger" data-eliminar="${item.id_recordatorio}">Desactivar</button>
        </td>
      </tr>
    `;
  }

  function enlazarAcciones() {
    document.querySelectorAll('[data-eliminar]').forEach((boton) => {
      boton.addEventListener('click', async () => {
        if (boton.dataset.confirmando !== '1') {
          boton.dataset.confirmando = '1';
          boton.textContent = 'Confirmar baja';
          SaludTime.mostrarMensaje('mensaje', 'Pulse «Confirmar baja» para desactivar el recordatorio.', 'error');
          window.setTimeout(() => {
            if (boton.isConnected && boton.dataset.confirmando === '1') {
              boton.dataset.confirmando = '';
              boton.textContent = 'Desactivar';
            }
          }, 6000);
          return;
        }
        SaludTime.ocultarMensaje('mensaje');
        boton.disabled = true;
        try {
          await SaludTime.api(`/recordatorios/${boton.dataset.eliminar}`, { method: 'DELETE' });
          SaludTime.mostrarMensaje('mensaje', 'Recordatorio desactivado.', 'success');
          await cargar();
        } catch (error) {
          SaludTime.mostrarMensaje('mensaje', error.message, 'error');
          boton.disabled = false;
          boton.dataset.confirmando = '';
          boton.textContent = 'Desactivar';
        }
      });
    });
  }

  async function cargar() {
    tabla.innerHTML = '<tr><td colspan="4" class="empty-state">Cargando...</td></tr>';

    const [listaTratamientos, medicamentos] = await Promise.all([
      SaludTime.api(`/tratamientos/paciente/${idUsuario}`),
      SaludTime.api('/medicamentos')
    ]);

    tratamientos = listaTratamientos.filter((t) => t.estado);
    medicamentosPorId = new Map(medicamentos.map((m) => [m.id_medicamento, m]));

    selectTratamiento.innerHTML = tratamientos.length
      ? '<option value="">Seleccione un tratamiento</option>' +
        tratamientos
          .map((t) => `<option value="${t.id_tratamiento}">${SaludTime.escapar(etiquetaTratamiento(t))}</option>`)
          .join('')
      : '<option value="">No hay tratamientos activos</option>';

    const listas = await Promise.all(
      tratamientos.map((t) => SaludTime.api(`/recordatorios/tratamiento/${t.id_tratamiento}`))
    );

    recordatorios = listas.flat().filter((r) => r.estado);

    contador.textContent = `${recordatorios.length} ${recordatorios.length === 1 ? 'recordatorio' : 'recordatorios'}`;
    tabla.innerHTML = recordatorios.length
      ? recordatorios.map(fila).join('')
      : '<tr><td colspan="4" class="empty-state">No hay recordatorios activos.</td></tr>';

    enlazarAcciones();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    SaludTime.ocultarMensaje('mensaje');

    const dias = diasSeleccionados();
    const datos = {
      id_tratamiento: Number(selectTratamiento.value),
      hora: document.getElementById('hora').value,
      dias_semana: dias.join(','),
      fecha_inicio: document.getElementById('fecha_inicio').value,
      fecha_fin: document.getElementById('fecha_fin').value || null
    };

    if (!datos.id_tratamiento) {
      SaludTime.mostrarMensaje('mensaje', 'Seleccione un tratamiento.', 'error');
      return;
    }
    if (!datos.hora) {
      SaludTime.mostrarMensaje('mensaje', 'Indique la hora del recordatorio.', 'error');
      return;
    }
    if (!dias.length) {
      SaludTime.mostrarMensaje('mensaje', 'Seleccione al menos un día de la semana.', 'error');
      return;
    }
    if (datos.fecha_fin && datos.fecha_fin < datos.fecha_inicio) {
      SaludTime.mostrarMensaje('mensaje', 'La fecha de fin no puede ser anterior a la de inicio.', 'error');
      return;
    }

    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    try {
      await SaludTime.api('/recordatorios', { method: 'POST', body: datos });
      SaludTime.mostrarMensaje('mensaje', 'Recordatorio creado.', 'success');
      form.reset();
      document.getElementById('fecha_inicio').value = SaludTime.fechaISO();
      document.querySelectorAll('#diasSemana input').forEach((i) => { i.checked = true; });
      await cargar();
    } catch (error) {
      SaludTime.mostrarMensaje('mensaje', error.message, 'error');
    } finally {
      btnGuardar.disabled = false;
      btnGuardar.textContent = 'Crear recordatorio';
    }
  });

  try {
    await cargar();
  } catch (error) {
    SaludTime.mostrarMensaje('mensaje', error.message, 'error');
    tabla.innerHTML = '<tr><td colspan="4" class="empty-state">No se pudieron cargar los recordatorios.</td></tr>';
  }
})();
