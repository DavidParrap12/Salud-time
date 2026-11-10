/**
 * Verificador HTTP de la API Salud Time.
 *
 * Requiere el servidor corriendo y, preferiblemente, datos frescos:
 *   Terminal 1: npm start
 *   Terminal 2: npm run seed
 *   Terminal 2: npm run verify
 *
 * Sale con código 1 si alguna prueba falla.
 */
const base = process.env.API_URL || 'http://localhost:3000';

const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const resultados = [];
let token = null;

const auth = () => (token ? { Authorization: `Bearer ${token}` } : {});

async function pedir(metodo, ruta, { body, headers = {} } = {}) {
  try {
    const res = await fetch(base + ruta, {
      method: metodo,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body === undefined ? undefined : JSON.stringify(body)
    });

    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    return { status: res.status, data };
  } catch (e) {
    return { status: 0, data: { error: e.message } };
  }
}

async function probar(nombre, metodo, ruta, { body, esperados = [200], headers = {} } = {}) {
  const res = await pedir(metodo, ruta, { body, headers });
  const ok = esperados.includes(res.status);

  resultados.push({ nombre, ok, status: res.status });

  const marca = ok ? 'OK  ' : 'FALLO';
  console.log(`[${marca}] ${metodo.padEnd(6)} ${ruta} -> ${res.status}`);

  if (!ok) {
    console.log(`         esperado: ${esperados.join(' o ')}`);
    console.log(`         respuesta: ${JSON.stringify(res.data)}`);
  }

  return res;
}

async function principal() {
  console.log('Verificación HTTP - Salud Time');
  console.log(`Servidor: ${base}\n`);

  // 1. Servicio
  await probar('Estado del servicio', 'GET', '/api/health');

  // 2. Autenticación
  const login = await probar('Login correcto', 'POST', '/api/auth/login', {
    body: { correo: 'paciente@saludtime.com', contrasena: 'Salud1234' }
  });
  token = login.data?.data?.token || null;

  await probar('Login con contraseña incorrecta', 'POST', '/api/auth/login', {
    body: { correo: 'paciente@saludtime.com', contrasena: 'incorrecta' },
    esperados: [401]
  });

  await probar('Registro con datos inválidos', 'POST', '/api/auth/registro/paciente', {
    body: { correo: 'no-es-correo' },
    esperados: [400]
  });

  await probar('Registro con correo duplicado', 'POST', '/api/auth/registro/paciente', {
    body: {
      nombre_completo: 'Paciente Duplicado',
      correo: 'paciente@saludtime.com',
      contrasena: 'Salud1234',
      edad: 40
    },
    esperados: [409]
  });

  // 3. Verificación de seguridad JWT
  await probar('Acceso a ruta protegida sin token', 'GET', '/api/medicamentos', {
    esperados: [401]
  });

  await probar('Acceso a ruta protegida con token inválido', 'GET', '/api/medicamentos', {
    headers: { Authorization: 'Bearer token_invalido_xyz' },
    esperados: [401]
  });

  // 4. Catálogos protegidos con JWT
  await probar('Especializaciones', 'GET', '/api/especializaciones', { headers: auth() });
  await probar('Roles', 'GET', '/api/roles', { headers: auth() });
  await probar('Usuarios', 'GET', '/api/usuarios', { headers: auth() });

  // 4. Medicamentos (CRUD + validación)
  await probar('Listar medicamentos', 'GET', '/api/medicamentos', { headers: auth() });

  await probar('Validar medicamento inválido', 'POST', '/api/medicamentos/validar', {
    body: { nombre: '' },
    headers: auth()
  });

  const nuevoMedicamento = await probar('Crear medicamento', 'POST', '/api/medicamentos', {
    body: {
      nombre: `Prueba HTTP ${Date.now()}`,
      presentacion: 'Tableta 10 mg',
      descripcion: 'Medicamento temporal de verificación',
      fecha_vencimiento: ymd(new Date(Date.now() + 30 * 86400000))
    },
    esperados: [201],
    headers: auth()
  });

  const idMedicamento = nuevoMedicamento.data?.data?.id_medicamento;

  if (idMedicamento) {
    await probar('Obtener medicamento', 'GET', `/api/medicamentos/${idMedicamento}`, {
      headers: auth()
    });
    await probar('Actualizar medicamento', 'PUT', `/api/medicamentos/${idMedicamento}`, {
      body: { descripcion: 'Descripción actualizada por la verificación' },
      headers: auth()
    });
    await probar('Consultar vencimiento', 'GET', `/api/medicamentos/${idMedicamento}/vencimiento`, {
      headers: auth()
    });
    await probar('Desactivar medicamento', 'DELETE', `/api/medicamentos/${idMedicamento}`, {
      headers: auth()
    });
  }

  // 5. Tratamientos y recordatorios
  await probar('Tratamientos del paciente', 'GET', '/api/tratamientos/paciente/1', {
    headers: auth()
  });
  await probar('Recordatorios del tratamiento', 'GET', '/api/recordatorios/tratamiento/1', {
    headers: auth()
  });

  // 6. Calendario y dashboard
  const hoy = new Date();
  await probar(
    'Calendario del mes',
    'GET',
    `/api/calendario/1?mes=${hoy.getMonth() + 1}&anio=${hoy.getFullYear()}`,
    { headers: auth() }
  );
  await probar('Calendario sin mes ni año', 'GET', '/api/calendario/1', {
    esperados: [400],
    headers: auth()
  });
  await probar('Calendario por fecha', 'GET', `/api/calendario/1/fecha?fecha=${ymd(hoy)}`, {
    headers: auth()
  });
  await probar('Dashboard', 'GET', '/api/dashboard/1', { headers: auth() });
  await probar('Dosis pendientes del dashboard', 'GET', '/api/dashboard/1/dosis-pendientes', {
    headers: auth()
  });

  // 7. Dosis: confirmar / alertar
  const pendientes = await probar('Dosis pendientes', 'GET', '/api/dosis/pendientes?id_paciente=1', {
    headers: auth()
  });

  const dosis = pendientes.data?.data?.[0];
  if (dosis) {
    await probar(`Confirmar dosis ${dosis.id_dosis_programada}`, 'POST', `/api/dosis/${dosis.id_dosis_programada}/confirmar`, {
      body: { observaciones: 'Confirmada por la verificación HTTP' },
      esperados: [201],
      headers: auth()
    });

    await probar('Generar alerta de dosis', 'POST', '/api/dosis/alerta', {
      body: {
        id_dosis_programada: dosis.id_dosis_programada,
        id_usuario_destinatario: 3
      },
      esperados: [201],
      headers: auth()
    });
  } else {
    console.log('[OMIT] No hay dosis pendientes: ejecute "npm run seed" para probar confirmar/alerta');
  }

  // 8. Notificaciones
  const notificaciones = await probar('Notificaciones del cuidador', 'GET', '/api/notificaciones/usuario/3', {
    headers: auth()
  });

  const notificacion = notificaciones.data?.data?.[0];
  if (notificacion) {
    await probar(`Marcar notificación ${notificacion.id_notificacion} como leída`, 'PATCH', `/api/notificaciones/${notificacion.id_notificacion}/leida`, {
      headers: auth()
    });
  }

  // 9. Cuidadores y registros
  await probar('Cuidadores del paciente', 'GET', '/api/cuidadores/paciente/1', { headers: auth() });
  await probar('Registros de dosis', 'GET', '/api/registros?id_paciente=1', { headers: auth() });

  // 10. Reportes
  const reporte = await probar('Generar reporte', 'POST', '/api/reportes', {
    body: {
      id_usuario: 1,
      fecha_inicio: ymd(new Date(Date.now() - 7 * 86400000)),
      fecha_fin: ymd(hoy)
    },
    esperados: [201],
    headers: auth()
  });

  const idReporte = reporte.data?.data?.id_reporte;
  if (idReporte) {
    await probar('Obtener reporte', 'GET', `/api/reportes/${idReporte}`, { headers: auth() });
    await probar('Estadísticas del reporte', 'GET', `/api/reportes/${idReporte}/estadisticas`, {
      headers: auth()
    });
    await probar('Cumplimiento del reporte', 'GET', `/api/reportes/${idReporte}/cumplimiento`, {
      headers: auth()
    });
    await probar('Compartir reporte', 'POST', '/api/reportes/compartir', {
      body: { id_reporte: idReporte, correo_destino: 'cuidador@saludtime.com' },
      headers: auth()
    });
  }

  // 11. Errores controlados
  await probar('Ruta inexistente', 'GET', '/api/ruta-inexistente', { esperados: [404] });
  await probar('Recurso inexistente', 'GET', '/api/medicamentos/999999', {
    esperados: [404],
    headers: auth()
  });
  await probar('Identificador no numérico', 'GET', '/api/medicamentos/abc', {
    esperados: [400],
    headers: auth()
  });
  await probar('Query de paciente inválida', 'GET', '/api/dosis/pendientes?id_paciente=abc', {
    esperados: [400],
    headers: auth()
  });
  await probar('Mes fuera de rango', 'GET', '/api/calendario/1?mes=13&anio=2026', {
    esperados: [400],
    headers: auth()
  });
  await probar('Reporte con fecha imposible', 'POST', '/api/reportes', {
    body: { id_usuario: 1, fecha_inicio: '2026-02-31', fecha_fin: '2026-03-10' },
    esperados: [400],
    headers: auth()
  });
  await probar('Actualizar usuario sin campos', 'PUT', '/api/usuarios/1', {
    body: {},
    esperados: [400],
    headers: auth()
  });

  // Resumen
  const fallos = resultados.filter((r) => !r.ok);
  const ok = resultados.length - fallos.length;

  console.log('\n' + '='.repeat(60));
  console.log(`Resultado: ${ok}/${resultados.length} pruebas correctas`);

  if (fallos.length) {
    console.log('\nPruebas fallidas:');
    for (const fallo of fallos) {
      console.log(` - ${fallo.nombre} (HTTP ${fallo.status})`);
    }
    process.exit(1);
  }

  console.log('Todas las peticiones HTTP respondieron como se esperaba.');
}

principal().catch((e) => {
  console.error('\nError inesperado en la verificación:', e.message);
  process.exit(1);
});
