(async function iniciarTratamientos() {
  if (!SaludTime.exigirSesion()) return;

  const idUsuario = SaludTime.idUsuario();
  const form = document.getElementById('formTratamiento');
  const select = document.getElementById('medicamentoTratamiento');
  const tabla = document.getElementById('tablaTratamientos');
  const boton = document.getElementById('btnGuardarTratamiento');
  const mensaje = document.getElementById('mensajeTratamiento');
  const inicio = document.getElementById('inicioTratamiento');
  const fin = document.getElementById('finTratamiento');
  inicio.value = SaludTime.fechaISO();

  async function cargar() {
    const [medicamentos, tratamientos] = await Promise.all([
      SaludTime.api('/medicamentos'),
      SaludTime.api(`/tratamientos/paciente/${idUsuario}`)
    ]);
    const porId = new Map(medicamentos.map((m) => [m.id_medicamento, m]));
    const seleccionado = select.value;
    select.innerHTML = '<option value="">Seleccione un medicamento</option>' + medicamentos
      .map((m) => `<option value="${m.id_medicamento}">${SaludTime.escapar(m.nombre)}</option>`).join('');
    if (medicamentos.some((m) => String(m.id_medicamento) === seleccionado)) select.value = seleccionado;

    const activos = tratamientos.filter((t) => t.estado);
    document.getElementById('contadorTratamientos').textContent = `${activos.length} tratamiento(s)`;
    tabla.innerHTML = activos.length ? activos.map((t) => `
      <tr>
        <td>${SaludTime.escapar(porId.get(t.id_medicamento)?.nombre || `Medicamento #${t.id_medicamento}`)}</td>
        <td>${SaludTime.escapar(t.dosis)}</td>
        <td>${SaludTime.formatearFecha(t.fecha_inicio)}</td>
        <td>${SaludTime.formatearFecha(t.fecha_fin)}</td>
      </tr>
    `).join('') : '<tr><td colspan="4" class="empty-state">Aún no hay tratamientos.</td></tr>';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    SaludTime.ocultarMensaje(mensaje);
    const datos = {
      id_paciente: idUsuario,
      id_medicamento: Number(select.value),
      dosis: document.getElementById('dosisTratamiento').value.trim(),
      fecha_inicio: inicio.value,
      fecha_fin: fin.value || null
    };
    if (!datos.id_medicamento || !datos.dosis || !datos.fecha_inicio) {
      SaludTime.mostrarMensaje(mensaje, 'Complete medicamento, dosis y fecha de inicio.');
      return;
    }
    if (datos.fecha_fin && datos.fecha_fin < datos.fecha_inicio) {
      SaludTime.mostrarMensaje(mensaje, 'La fecha de fin debe ser posterior al inicio.');
      return;
    }
    boton.disabled = true;
    try {
      await SaludTime.api('/tratamientos', { method: 'POST', body: datos });
      SaludTime.mostrarMensaje(mensaje, 'Tratamiento guardado en la base de datos.', 'success');
      form.reset();
      inicio.value = SaludTime.fechaISO();
      await cargar();
    } catch (error) {
      SaludTime.mostrarMensaje(mensaje, error.message);
    } finally {
      boton.disabled = false;
    }
  });

  window.addEventListener('medicamentosActualizados', () => cargar().catch((error) =>
    SaludTime.mostrarMensaje(mensaje, error.message)));
  try {
    await cargar();
  } catch (error) {
    SaludTime.mostrarMensaje(mensaje, error.message);
  }
})();
