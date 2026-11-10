/**
 * Verificación de los datos almacenados en PostgreSQL.
 *
 * Uso: npm run verify:db
 *
 * 1. Ejecuta consultas de integridad sobre las tablas reales.
 * 2. Intenta guardar datos inválidos y comprueba que los modelos los rechacen.
 *
 * No modifica datos: las pruebas de escritura se hacen dentro de transacciones
 * que siempre se revierten.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { QueryTypes } = require('sequelize');
const {
  sequelize,
  Usuario,
  Medicamento,
  Recordatorio,
  DosisProgramada,
  Reporte
} = require('../src/models');

const resultados = [];

const registrar = (nombre, ok, detalle = '') => {
  resultados.push({ nombre, ok, detalle });
  console.log(`[${ok ? 'OK  ' : 'FALLO'}] ${nombre}${detalle ? ` -> ${detalle}` : ''}`);
};

/**
 * Cada control devuelve cuántas filas incumplen una regla.
 * Lo correcto es que todas devuelvan 0.
 */
const controles = [
  {
    nombre: 'USUARIO: nombre y contraseña no vacíos',
    sql: `SELECT COUNT(*)::int AS n FROM "USUARIO"
          WHERE nombre_completo IS NULL OR btrim(nombre_completo) = ''
             OR contrasena_hash IS NULL OR btrim(contrasena_hash) = ''`
  },
  {
    nombre: 'USUARIO: correos con formato válido',
    sql: `SELECT COUNT(*)::int AS n FROM "USUARIO"
          WHERE correo !~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'`
  },
  {
    nombre: 'USUARIO: edades entre 0 y 120',
    sql: `SELECT COUNT(*)::int AS n FROM "USUARIO"
          WHERE edad IS NULL OR edad < 0 OR edad > 120`
  },
  {
    nombre: 'medicamento: nombre no vacío',
    sql: `SELECT COUNT(*)::int AS n FROM medicamento
          WHERE nombre IS NULL OR btrim(nombre) = ''`
  },
  {
    nombre: 'tratamiento: dosis y fechas coherentes',
    sql: `SELECT COUNT(*)::int AS n FROM tratamiento
          WHERE dosis IS NULL OR btrim(dosis) = ''
             OR fecha_inicio IS NULL
             OR (fecha_fin IS NOT NULL AND fecha_fin < fecha_inicio)`
  },
  {
    nombre: 'tratamiento: paciente y medicamento existentes',
    sql: `SELECT COUNT(*)::int AS n FROM tratamiento t
          LEFT JOIN "USUARIO" u ON u.id_usuario = t.id_paciente
          LEFT JOIN medicamento m ON m.id_medicamento = t.id_medicamento
          WHERE u.id_usuario IS NULL OR m.id_medicamento IS NULL`
  },
  {
    nombre: 'RECORDATORIO: hora y días con formato',
    sql: `SELECT COUNT(*)::int AS n FROM "RECORDATORIO"
          WHERE hora IS NULL
             OR dias_semana IS NULL OR btrim(dias_semana) = ''
             OR fecha_inicio IS NULL
             OR (fecha_fin IS NOT NULL AND fecha_fin < fecha_inicio)`
  },
  {
    nombre: 'RECORDATORIO: tratamiento existente',
    sql: `SELECT COUNT(*)::int AS n FROM "RECORDATORIO" r
          LEFT JOIN tratamiento t ON t.id_tratamiento = r.id_tratamiento
          WHERE t.id_tratamiento IS NULL`
  },
  {
    nombre: 'dosis_programada: estados permitidos',
    sql: `SELECT COUNT(*)::int AS n FROM dosis_programada
          WHERE estado NOT IN ('PENDIENTE', 'TOMADA', 'OMITIDA', 'POSPUESTA')`
  },
  {
    nombre: 'dosis_programada: recordatorio existente',
    sql: `SELECT COUNT(*)::int AS n FROM dosis_programada d
          LEFT JOIN "RECORDATORIO" r ON r.id_recordatorio = d.id_recordatorio
          WHERE r.id_recordatorio IS NULL`
  },
  {
    nombre: 'registro_dosis: una sola confirmación por dosis',
    sql: `SELECT COUNT(*)::int AS n FROM (
            SELECT id_dosis_programada FROM registro_dosis
            GROUP BY id_dosis_programada HAVING COUNT(*) > 1
          ) duplicados`
  },
  {
    nombre: 'notificacion: estados y mensaje válidos',
    sql: `SELECT COUNT(*)::int AS n FROM notificacion
          WHERE estado NOT IN ('PENDIENTE', 'ENVIADA', 'LEIDA', 'FALLIDA')
             OR mensaje IS NULL OR btrim(mensaje) = ''
             OR tipo IS NULL OR btrim(tipo) = ''`
  },
  {
    nombre: 'notificacion: dosis y destinatario existentes',
    sql: `SELECT COUNT(*)::int AS n FROM notificacion n
          LEFT JOIN dosis_programada d ON d.id_dosis_programada = n.id_dosis_programada
          LEFT JOIN "USUARIO" u ON u.id_usuario = n.id_usuario_destinatario
          WHERE d.id_dosis_programada IS NULL OR u.id_usuario IS NULL`
  },
  {
    nombre: 'reporte: conteos no negativos y adherencia 0-100',
    sql: `SELECT COUNT(*)::int AS n FROM reporte
          WHERE total < 0 OR tomadas < 0 OR omitidas < 0
             OR adherencia < 0 OR adherencia > 100
             OR fecha_fin < fecha_inicio`
  },
  {
    nombre: 'cuidador_paciente: cuidador distinto del paciente',
    sql: `SELECT COUNT(*)::int AS n FROM cuidador_paciente
          WHERE id_paciente = id_cuidador`
  },
  {
    nombre: 'cuidador_paciente: usuarios existentes',
    sql: `SELECT COUNT(*)::int AS n FROM cuidador_paciente c
          LEFT JOIN "USUARIO" p ON p.id_usuario = c.id_paciente
          LEFT JOIN "USUARIO" u ON u.id_usuario = c.id_cuidador
          WHERE p.id_usuario IS NULL OR u.id_usuario IS NULL`
  },
  {
    nombre: 'USUARIO_ROL: usuario y rol existentes',
    sql: `SELECT COUNT(*)::int AS n FROM "USUARIO_ROL" ur
          LEFT JOIN "USUARIO" u ON u.id_usuario = ur.id_usuario
          LEFT JOIN "ROL" r ON r.id_rol = ur.id_rol
          WHERE u.id_usuario IS NULL OR r.id_rol IS NULL`
  },
  {
    nombre: 'medico_especializacion: referencias existentes',
    sql: `SELECT COUNT(*)::int AS n FROM medico_especializacion me
          LEFT JOIN "USUARIO" u ON u.id_usuario = me.id_usuario
          LEFT JOIN "ESPECIALIZACION" e ON e.id_especializacion = me.id_especializacion
          WHERE u.id_usuario IS NULL OR e.id_especializacion IS NULL`
  }
];

/**
 * Intenta guardar un dato inválido dentro de una transacción.
 * Se considera correcto si el modelo lo rechaza (validación Sequelize).
 */
async function rechazaDatoInvalido(nombre, guardar) {
  let rechazado = false;
  let motivo = '';

  try {
    await sequelize.transaction(async (transaction) => {
      await guardar(transaction);
      // Si llegó aquí, el dato inválido fue aceptado: hay que revertir.
      throw new Error('__ROLLBACK__');
    });
  } catch (e) {
    rechazado = e.message !== '__ROLLBACK__';
    motivo = rechazado ? e.message.split('\n')[0] : 'el modelo aceptó el dato';
  }

  registrar(nombre, rechazado, motivo);
}

async function principal() {
  console.log('Verificación de datos en PostgreSQL');
  console.log(`Base de datos: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}\n`);

  await sequelize.authenticate();

  // 1. Integridad de los datos ya almacenados.
  for (const control of controles) {
    const [fila] = await sequelize.query(control.sql, { type: QueryTypes.SELECT });
    const incumplimientos = Number(fila.n || 0);
    registrar(control.nombre, incumplimientos === 0, `${incumplimientos} incumplimiento(s)`);
  }

  // 2. Validaciones de modelo antes de escribir.
  await rechazaDatoInvalido('Rechaza correo con formato inválido', (transaction) =>
    Usuario.create({
      nombre_completo: 'Prueba BD',
      correo: 'no-es-correo',
      contrasena_hash: 'hash',
      edad: 30
    }, { transaction })
  );

  await rechazaDatoInvalido('Rechaza edad fuera de rango', (transaction) =>
    Usuario.create({
      nombre_completo: 'Prueba BD',
      correo: `prueba-${Date.now()}@saludtime.com`,
      contrasena_hash: 'hash',
      edad: 200
    }, { transaction })
  );

  await rechazaDatoInvalido('Rechaza medicamento con nombre vacío', (transaction) =>
    Medicamento.create({ nombre: '   ' }, { transaction })
  );

  await rechazaDatoInvalido('Rechaza recordatorio con fecha_fin anterior', (transaction) =>
    Recordatorio.create({
      id_tratamiento: 1,
      hora: '08:00',
      dias_semana: 'LUN',
      fecha_inicio: '2026-12-31',
      fecha_fin: '2026-01-01'
    }, { transaction })
  );

  await rechazaDatoInvalido('Rechaza reporte con adherencia mayor a 100', (transaction) =>
    Reporte.create({
      id_usuario: 1,
      fecha_inicio: '2026-01-01',
      fecha_fin: '2026-01-31',
      total: 1,
      tomadas: 1,
      omitidas: 0,
      adherencia: 150
    }, { transaction })
  );

  await rechazaDatoInvalido('Rechaza dosis con estado desconocido', (transaction) =>
    DosisProgramada.create({
      id_recordatorio: 1,
      fecha_hora: new Date(),
      estado: 'INVENTADO'
    }, { transaction })
  );

  const fallos = resultados.filter((r) => !r.ok);
  const correctas = resultados.length - fallos.length;

  console.log('\n' + '='.repeat(60));
  console.log(`Resultado: ${correctas}/${resultados.length} controles correctos`);

  if (fallos.length) {
    console.log('\nControles fallidos:');
    for (const fallo of fallos) console.log(` - ${fallo.nombre} (${fallo.detalle})`);
  }

  await sequelize.close();
  process.exit(fallos.length ? 1 : 0);
}

principal().catch(async (e) => {
  console.error('\nError inesperado en la verificación:', e.message);
  await sequelize.close().catch(() => {});
  process.exit(1);
});
