/**
 * Cliente de la API Salud Time.
 *
 * Todas las peticiones pasan por `/api/*`; el servidor del frontend hace de
 * proxy hacia el backend (que persiste en PostgreSQL).
 */
window.SaludTime = (() => {
  const BASE = '/api';
  const TOKEN_KEY = 'saludtime_token';
  const USUARIO_KEY = 'saludtime_usuario';
  const ROLES_KEY = 'saludtime_roles';

  const token = () => localStorage.getItem(TOKEN_KEY);

  const usuario = () => {
    try {
      return JSON.parse(localStorage.getItem(USUARIO_KEY));
    } catch {
      return null;
    }
  };

  const roles = () => {
    try {
      return JSON.parse(localStorage.getItem(ROLES_KEY)) || [];
    } catch {
      return [];
    }
  };

  const guardarSesion = (data) => {
    if (!data || !data.token) throw new Error('La respuesta del login no incluyó el token');
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(data.usuario || null));
    localStorage.setItem(ROLES_KEY, JSON.stringify(data.roles || []));
  };

  const cerrarSesion = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    localStorage.removeItem(ROLES_KEY);
    window.location.href = '/inicio-sesion/login.html';
  };

  const idUsuario = () => usuario()?.id_usuario || null;

  /** Hace una petición a la API y devuelve `data` o lanza un Error legible. */
  async function api(ruta, { method = 'GET', body, auth = true } = {}) {
    const headers = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (auth && token()) headers.Authorization = `Bearer ${token()}`;

    let respuesta;
    try {
      respuesta = await fetch(BASE + ruta, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body)
      });
    } catch {
      throw new Error('No se pudo conectar con el servidor. Verifique que el backend esté corriendo.');
    }

    let payload = null;
    try {
      payload = await respuesta.json();
    } catch {
      payload = null;
    }

    if (!respuesta.ok || payload?.success === false) {
      const detalles = Array.isArray(payload?.detalles) ? payload.detalles : [];
      const mensaje = detalles.length
        ? detalles.join(' · ')
        : payload?.mensaje || `Error ${respuesta.status}`;
      const error = new Error(mensaje);
      error.status = respuesta.status;
      throw error;
    }

    return payload?.data ?? null;
  }

  /** Redirige al login si no hay sesión guardada. */
  function exigirSesion() {
    if (!token()) {
      window.location.replace('/inicio-sesion/login.html');
      return false;
    }
    return true;
  }

  /** Pinta el nombre del usuario, el año, la fecha y el botón de salir. */
  function iniciarNavegacion() {
    const actual = usuario();
    const nombre = document.getElementById('nombreUsuario');
    if (nombre && actual) nombre.textContent = actual.nombre_completo || actual.correo;

    const salir = document.getElementById('btnLogout');
    if (salir) salir.addEventListener('click', cerrarSesion);

    const anio = document.getElementById('anio');
    if (anio) anio.textContent = new Date().getFullYear();

    const fecha = document.getElementById('fechaHoy');
    if (fecha) {
      fecha.textContent = new Date().toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  /** Devuelve `dd/mm/aaaa` sin desplazar la fecha por la zona horaria. */
  function formatearFecha(valor) {
    if (!valor) return '—';

    // DATEONLY: llega como YYYY-MM-DD y no debe convertirse a UTC.
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(valor))) {
      const [anio, mes, dia] = String(valor).split('-');
      return `${dia}/${mes}/${anio}`;
    }

    const fecha = new Date(valor);
    return Number.isNaN(fecha.getTime()) ? '—' : fecha.toLocaleDateString('es-CO');
  }

  function formatearHora(valor) {
    if (!valor) return '—';

    // TIME de PostgreSQL: llega como HH:MM:SS.
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(String(valor))) {
      return String(valor).slice(0, 5);
    }

    // DATE/DATETIME: convertir a la hora local del navegador.
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return '—';
    return fecha.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  function formatearFechaHora(valor) {
    if (!valor) return '—';
    return `${formatearFecha(valor)} ${formatearHora(valor)}`;
  }

  /** Fecha local en formato YYYY-MM-DD (para inputs y query params). */
  function fechaISO(fecha = new Date()) {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  function escapar(texto) {
    return String(texto ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[c]);
  }

  /** Muestra un mensaje de éxito o error dentro de un elemento. */
  function mostrarMensaje(elemento, mensaje, tipo = 'error') {
    const el = typeof elemento === 'string' ? document.getElementById(elemento) : elemento;
    if (!el) return;
    el.textContent = mensaje;
    el.className = `alert alert-${tipo}`;
    el.hidden = false;
    if (tipo === 'success') {
      window.clearTimeout(el._timeout);
      el._timeout = window.setTimeout(() => { el.hidden = true; }, 4000);
    }
  }

  function ocultarMensaje(elemento) {
    const el = typeof elemento === 'string' ? document.getElementById(elemento) : elemento;
    if (el) el.hidden = true;
  }

  const estadoTexto = {
    PENDIENTE: 'Pendiente',
    TOMADA: 'Tomada',
    OMITIDA: 'Omitida',
    POSPUESTA: 'Pospuesta'
  };

  const estadoClase = {
    PENDIENTE: 'status-pending',
    TOMADA: 'status-done',
    OMITIDA: 'status-missed',
    POSPUESTA: 'status-pending'
  };

  return {
    api,
    token,
    usuario,
    roles,
    guardarSesion,
    cerrarSesion,
    idUsuario,
    exigirSesion,
    iniciarNavegacion,
    formatearFecha,
    formatearHora,
    formatearFechaHora,
    fechaISO,
    escapar,
    mostrarMensaje,
    ocultarMensaje,
    estadoTexto,
    estadoClase
  };
})();
