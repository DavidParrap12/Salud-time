/**
 * CRUD de medicamentos contra la API.
 */
(async function iniciarMedicamentos() {
  if (!SaludTime.exigirSesion()) return;
  SaludTime.iniciarNavegacion();

  const form = document.getElementById('formMedicamento');
  const tabla = document.getElementById('tablaMedicamentos');
  const titulo = document.getElementById('tituloFormulario');
  const btnGuardar = document.getElementById('btnGuardar');
  const btnCancelar = document.getElementById('btnCancelar');
  const contador = document.getElementById('contadorMedicamentos');
  const campos = {
    id: document.getElementById('idMedicamento'),
    nombre: document.getElementById('nombre'),
    presentacion: document.getElementById('presentacion'),
    descripcion: document.getElementById('descripcion'),
    fecha: document.getElementById('fecha_vencimiento')
  };

  let medicamentos = [];

  function limpiarFormulario() {
    form.reset();
    campos.id.value = '';
    titulo.textContent = 'Nuevo medicamento';
    btnGuardar.textContent = 'Guardar medicamento';
    btnCancelar.hidden = true;
  }

  function fila(medicamento) {
    const vencimiento = medicamento.fecha_vencimiento
      ? SaludTime.formatearFecha(medicamento.fecha_vencimiento)
      : '—';
    const vencido =
      medicamento.fecha_vencimiento &&
      medicamento.fecha_vencimiento < SaludTime.fechaISO();

    return `
      <tr>
        <td>
          <strong>${SaludTime.escapar(medicamento.nombre)}</strong>
          ${medicamento.descripcion ? `<div class="muted small">${SaludTime.escapar(medicamento.descripcion)}</div>` : ''}
        </td>
        <td>${SaludTime.escapar(medicamento.presentacion || '—')}</td>
        <td>
          <span class="badge ${vencido ? 'badge-danger' : 'badge-ok'}">${vencimiento}</span>
        </td>
        <td class="acciones">
          <button class="btn-small" data-editar="${medicamento.id_medicamento}">Editar</button>
          <button class="btn-small btn-danger" data-eliminar="${medicamento.id_medicamento}">Desactivar</button>
        </td>
      </tr>
    `;
  }

  function enlazarAcciones() {
    document.querySelectorAll('[data-editar]').forEach((boton) => {
      boton.addEventListener('click', () => {
        const medicamento = medicamentos.find(
          (m) => String(m.id_medicamento) === boton.dataset.editar
        );
        if (!medicamento) return;

        campos.id.value = medicamento.id_medicamento;
        campos.nombre.value = medicamento.nombre || '';
        campos.presentacion.value = medicamento.presentacion || '';
        campos.descripcion.value = medicamento.descripcion || '';
        campos.fecha.value = medicamento.fecha_vencimiento
          ? String(medicamento.fecha_vencimiento).slice(0, 10)
          : '';

        titulo.textContent = `Editar: ${medicamento.nombre}`;
        btnGuardar.textContent = 'Guardar cambios';
        btnCancelar.hidden = false;
        campos.nombre.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    document.querySelectorAll('[data-eliminar]').forEach((boton) => {
      boton.addEventListener('click', async () => {
        if (!window.confirm('¿Desactivar este medicamento?')) return;
        boton.disabled = true;
        try {
          await SaludTime.api(`/medicamentos/${boton.dataset.eliminar}`, { method: 'DELETE' });
          SaludTime.mostrarMensaje('mensaje', 'Medicamento desactivado.', 'success');
          await cargar();
        } catch (error) {
          SaludTime.mostrarMensaje('mensaje', error.message, 'error');
          boton.disabled = false;
        }
      });
    });
  }

  async function cargar() {
    tabla.innerHTML = '<tr><td colspan="4" class="empty-state">Cargando...</td></tr>';
    medicamentos = await SaludTime.api('/medicamentos');

    contador.textContent = `${medicamentos.length} medicamento(s)`;
    tabla.innerHTML = medicamentos.length
      ? medicamentos.map(fila).join('')
      : '<tr><td colspan="4" class="empty-state">Aún no hay medicamentos registrados.</td></tr>';

    enlazarAcciones();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    SaludTime.ocultarMensaje('mensaje');

    const datos = {
      nombre: campos.nombre.value.trim(),
      presentacion: campos.presentacion.value.trim() || null,
      descripcion: campos.descripcion.value.trim() || null,
      fecha_vencimiento: campos.fecha.value || null
    };

    if (datos.nombre.length < 2) {
      SaludTime.mostrarMensaje('mensaje', 'El nombre debe tener al menos 2 caracteres.', 'error');
      return;
    }

    const editando = Boolean(campos.id.value);
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    try {
      if (editando) {
        await SaludTime.api(`/medicamentos/${campos.id.value}`, { method: 'PUT', body: datos });
        SaludTime.mostrarMensaje('mensaje', 'Medicamento actualizado.', 'success');
      } else {
        await SaludTime.api('/medicamentos', { method: 'POST', body: datos });
        SaludTime.mostrarMensaje('mensaje', 'Medicamento registrado.', 'success');
      }
      limpiarFormulario();
      await cargar();
    } catch (error) {
      SaludTime.mostrarMensaje('mensaje', error.message, 'error');
    } finally {
      btnGuardar.disabled = false;
      btnGuardar.textContent = editando ? 'Guardar cambios' : 'Guardar medicamento';
    }
  });

  btnCancelar.addEventListener('click', limpiarFormulario);

  try {
    await cargar();
  } catch (error) {
    SaludTime.mostrarMensaje('mensaje', error.message, 'error');
    tabla.innerHTML = '<tr><td colspan="4" class="empty-state">No se pudo cargar el catálogo.</td></tr>';
  }
})();
