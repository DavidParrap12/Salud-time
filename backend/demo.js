/**
 * Demostración automática de la API (requiere el servidor corriendo).
 * Uso:
 *   Terminal 1: npm start
 *   Terminal 2: npm run demo
 */
const base = process.env.API_URL || 'http://localhost:3000';

const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

async function req(method, url, body) {
  const res = await fetch(base + url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  let data = null;
  try { data = await res.json(); } catch {}
  return { status: res.status, data };
}

function print(titulo, r) {
  console.log(`\n${'-'.repeat(60)}`);
  console.log(`${titulo}  [HTTP ${r.status}]`);
  console.log(JSON.stringify(r.data, null, 2));
}

async function esperarServidor() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(base + '/api/health');
      if (r.ok) return true;
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

(async () => {
  console.log('Salud Time - demostración de la API');
  if (!(await esperarServidor())) {
    console.error(`\nNo hay servidor en ${base}. Ejecute primero: npm start`);
    process.exit(1);
  }

  print('1. Estado del servicio', await req('GET', '/api/health'));

  const login = await req('POST', '/api/auth/login', {
    correo: 'paciente@saludtime.com',
    contrasena: 'Salud1234'
  });
  print('2. Login del paciente', login);

  print('3. Medicamentos', await req('GET', '/api/medicamentos'));

  const hoy = new Date();
  print(
    '4. Calendario del mes actual',
    await req('GET', `/api/calendario/1?mes=${hoy.getMonth() + 1}&anio=${hoy.getFullYear()}`)
  );

  print('5. Dashboard del paciente', await req('GET', '/api/dashboard/1'));

  const pendientes = await req('GET', '/api/dosis/pendientes');
  const dosis = pendientes.data?.data?.[0];

  if (dosis) {
    print(
      `6. Confirmar dosis pendiente (id ${dosis.id_dosis_programada})`,
      await req('POST', `/api/dosis/${dosis.id_dosis_programada}/confirmar`, {
        observaciones: 'Dosis confirmada desde la demo'
      })
    );
  } else {
    console.log('\n6. No hay dosis pendientes para confirmar');
  }

  print(
    '7. Reporte de adherencia (últimos 7 días)',
    await req('POST', '/api/reportes', {
      id_usuario: 1,
      fecha_inicio: ymd(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 7)),
      fecha_fin: ymd(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()))
    })
  );

  print(
    '8. Notificaciones del cuidador',
    await req('GET', '/api/notificaciones/usuario/3')
  );

  console.log('\n' + '='.repeat(60));
  console.log('Demostración finalizada.');
})();
