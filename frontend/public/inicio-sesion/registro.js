/**
 * Registro de pacientes contra la API Salud Time.
 * Envía el JSON que valida RegistroPacienteDTO y luego vuelve al login.
 */
const form = document.getElementById('registroForm');
const mensaje = document.getElementById('mensajeError');

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  SaludTime.ocultarMensaje(mensaje);

  const datos = {
    nombre_completo: document.getElementById('nombre').value.trim(),
    correo: document.getElementById('correo').value.trim(),
    edad: Number(document.getElementById('edad').value),
    telefono: document.getElementById('telefono').value.trim() || null,
    contrasena: document.getElementById('contraseña').value
  };

  const faltantes = [];
  if (datos.nombre_completo.length < 3) faltantes.push('El nombre debe tener al menos 3 caracteres');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) faltantes.push('El correo no es válido');
  if (!Number.isInteger(datos.edad) || datos.edad < 0 || datos.edad > 120) {
    faltantes.push('La edad debe ser un número entre 0 y 120');
  }
  if (datos.contrasena.length < 8) faltantes.push('La contraseña debe tener al menos 8 caracteres');

  if (faltantes.length) {
    SaludTime.mostrarMensaje(mensaje, faltantes.join(' · '), 'error');
    return;
  }

  const boton = form.querySelector('button[type="submit"]');
  boton.disabled = true;
  boton.textContent = 'Creando cuenta...';

  try {
    await SaludTime.api('/auth/registro/paciente', {
      method: 'POST',
      auth: false,
      body: datos
    });

    window.location.href = '/inicio-sesion/login.html?registrado=1';
  } catch (error) {
    SaludTime.mostrarMensaje(mensaje, error.message, 'error');
  } finally {
    boton.disabled = false;
    boton.textContent = 'Registrarse';
  }
});
