/**
 * Calendario mensual de dosis.
 * Consume /api/calendario/:id_usuario?mes=&anio= y
 * /api/calendario/:id_usuario/fecha?fecha=YYYY-MM-DD.
 */
(async function iniciarCalendario() {
  if (!SaludTime.exigirSesion()) return;
  SaludTime.iniciarNavegacion();

  const idUsuario = SaludTime.idUsuario();
  const grid = document.getElementById('diasCalendario');
  const titulo = document.getElementById('tituloMes');
  const resumen = document.getElementById('resumenMes');
  const detalle = document.getElementById('detalleDia');
  const tituloDetalle = document.getElementById('tituloDetalle');
  const listaDetalle = document.getElementById('listaDetalle');

  const hoy = new Date();
  let anio = hoy.getFullYear();
  let mes = hoy.getMonth() + 1;
  let contexto = new Map();

  const nombresMes = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  async function cargarContexto() {
    const [tratamientos, medicamentos] = await Promise.all([
      SaludTime.api(`/tratamientos/paciente/${idUsuario}`),
      SaludTime.api('/medicamentos')
    ]);

    const medicamentosPorId = new Map(medicamentos.map((m) => [m.id_medicamento, m]));
    const tratamientosPorId = new Map(tratamientos.map((t) => [t.id_tratamiento, t]));

    const listas = await Promise.all(
      tratamientos
        .filter((t) => t.estado)
        .map((t) => SaludTime.api(`/recordatorios/tratamiento/${t.id_tratamiento}`))
    );

    contexto = new Map();
    for (const lista of listas) {
      for (const recordatorio of lista) {
        const tratamiento = tratamientosPorId.get(recordatorio.id_tratamiento);
        contexto.set(recordatorio.id_recordatorio, {
          tratamiento,
          medicamento: medicamentosPorId.get(tratamiento?.id_medicamento)
        });
      }
    }
  }

  function nombreDosis(dosis) {
    const ctx = contexto.get(dosis.id_recordatorio);
    return ctx?.medicamento?.nombre || 'Medicamento';
  }

  function pintarDetalle(fecha, dosis) {
    tituloDetalle.textContent = `Dosis del ${SaludTime.formatearFecha(fecha)}`;
    detalle.hidden = false;

    listaDetalle.innerHTML = dosis.length
      ? dosis
          .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora))
          .map((d) => {
            const estado = SaludTime.estadoTexto[d.estado] || d.estado;
            const clase = SaludTime.estadoClase[d.estado] || 'status-pending';
            return `
              <div class="med-item">
                <div class="med-icon"><span class="material-icons">medication</span></div>
                <div class="med-info">
                  <div class="med-name">${SaludTime.escapar(nombreDosis(d))}</div>
                  <div class="med-dose">${SaludTime.formatearHora(d.fecha_hora)}</div>
                </div>
                <span class="reminder-status ${clase}">${SaludTime.escapar(estado)}</span>
              </div>
            `;
          })
          .join('')
      : '<p class="empty-state">No hay dosis programadas para este día.</p>';
  }

  async function cargarDia(fecha) {
    try {
      const dosis = await SaludTime.api(
        `/calendario/${idUsuario}/fecha?fecha=${encodeURIComponent(fecha)}`
      );
      pintarDetalle(fecha, dosis);
    } catch (error) {
      SaludTime.mostrarMensaje('mensaje', error.message, 'error');
    }
  }

  async function cargarMes() {
    titulo.textContent = `${nombresMes[mes - 1]} ${anio}`;
    grid.innerHTML = '<p class="empty-state">Cargando...</p>';
    detalle.hidden = true;

    const datos = await SaludTime.api(`/calendario/${idUsuario}?mes=${mes}&anio=${anio}`);
    const porFecha = new Map((datos.dias || []).map((d) => [d.fecha, d]));

    const primero = new Date(anio, mes - 1, 1);
    const totalDias = new Date(anio, mes, 0).getDate();
    const desplazamiento = (primero.getDay() + 6) % 7; // lunes = 0

    let html = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
      .map((d) => `<div class="calendar-weekday">${d}</div>`)
      .join('');

    for (let i = 0; i < desplazamiento; i++) {
      html += '<div class="calendar-day empty"></div>';
    }

    const hoyISO = SaludTime.fechaISO();
    let totalTomadas = 0;
    let totalOmitidas = 0;
    let totalDosis = 0;

    for (let dia = 1; dia <= totalDias; dia++) {
      const fecha = SaludTime.fechaISO(new Date(anio, mes - 1, dia));
      const info = porFecha.get(fecha);
      const clases = ['calendar-day'];
      if (fecha === hoyISO) clases.push('today');
      if (info) clases.push('has-data');

      totalTomadas += info?.tomadas || 0;
      totalOmitidas += info?.omitidas || 0;
      totalDosis += info?.total || 0;

      html += `
        <button type="button" class="${clases.join(' ')}" data-fecha="${fecha}">
          <span class="day-number">${dia}</span>
          ${
            info
              ? `<span class="day-info">${info.total} dosis</span>
                 <span class="day-counts">
                   ${info.tomadas ? `<i class="dot done"></i>${info.tomadas}` : ''}
                   ${info.omitidas ? `<i class="dot missed"></i>${info.omitidas}` : ''}
                 </span>`
              : ''
          }
        </button>
      `;
    }

    grid.innerHTML = html;
    resumen.textContent = totalDosis
      ? `Este mes: ${totalDosis} dosis programadas, ${totalTomadas} tomadas y ${totalOmitidas} omitidas.`
      : 'Este mes no tienes dosis programadas.';

    grid.querySelectorAll('[data-fecha]').forEach((boton) => {
      boton.addEventListener('click', () => cargarDia(boton.dataset.fecha));
    });
  }

  document.getElementById('btnAnterior').addEventListener('click', () => {
    mes--;
    if (mes < 1) { mes = 12; anio--; }
    cargarMes().catch((e) => SaludTime.mostrarMensaje('mensaje', e.message, 'error'));
  });

  document.getElementById('btnSiguiente').addEventListener('click', () => {
    mes++;
    if (mes > 12) { mes = 1; anio++; }
    cargarMes().catch((e) => SaludTime.mostrarMensaje('mensaje', e.message, 'error'));
  });

  document.getElementById('btnHoy').addEventListener('click', () => {
    anio = new Date().getFullYear();
    mes = new Date().getMonth() + 1;
    cargarMes().catch((e) => SaludTime.mostrarMensaje('mensaje', e.message, 'error'));
  });

  try {
    await cargarContexto();
    await cargarMes();
  } catch (error) {
    SaludTime.mostrarMensaje('mensaje', error.message, 'error');
    grid.innerHTML = '<p class="empty-state">No se pudo cargar el calendario.</p>';
  }
})();
