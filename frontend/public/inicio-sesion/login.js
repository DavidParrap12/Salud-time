/**
 * Login contra la API Salud Time.
 * La sesión se guarda en localStorage (token + usuario + roles).
 */
const form = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

// Si viene de registrarse, mostramos confirmación.
const parametros = new URLSearchParams(window.location.search);
if (parametros.get('registrado') === '1') {
  SaludTime.mostrarMensaje('mensajeExito', 'Cuenta creada correctamente. Ya puedes iniciar sesión.', 'success');
}

// Si ya hay una sesión guardada, no tiene sentido volver al login.
if (SaludTime.token()) {
  window.location.replace('/principal.html');
}

function mostrarError(mensaje) {
  errorMsg.querySelector('span:last-child').textContent = mensaje;
  errorMsg.classList.add('show');
}

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  errorMsg.classList.remove('show');

  const correo = document.getElementById('correo').value.trim();
  const contrasena = document.getElementById('contraseña').value;
  const boton = form.querySelector('button[type="submit"]');

  boton.disabled = true;
  boton.textContent = 'Ingresando...';

  try {
    const data = await SaludTime.api('/auth/login', {
      method: 'POST',
      auth: false,
      body: { correo, contrasena }
    });

    SaludTime.guardarSesion(data);
    window.location.href = '/principal.html';
  } catch (error) {
    mostrarError(error.message);
  } finally {
    boton.disabled = false;
    boton.textContent = 'Iniciar Sesión';
  }
});

// Ocultar el error cuando el usuario empiece a escribir.
for (const id of ['correo', 'contraseña']) {
  document.getElementById(id).addEventListener('input', function () {
    errorMsg.classList.remove('show');
  });
}

// Botón para mostrar/ocultar contraseña.
document.getElementById('togglePass').addEventListener('click', function () {
  const passInput = document.getElementById('contraseña');
  const icon = this.querySelector('.material-icons');

  if (passInput.type === 'password') {
    passInput.type = 'text';
    icon.textContent = 'visibility_off';
  } else {
    passInput.type = 'password';
    icon.textContent = 'visibility';
  }
});
