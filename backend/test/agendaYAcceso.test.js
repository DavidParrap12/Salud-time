const test = require('node:test');
const assert = require('node:assert/strict');
const { fechasProgramadas } = require('../src/utils/programarDosis');
const { exigirPropietario } = require('../src/utils/acceso');

test('programa únicamente los días elegidos y conserva la hora local', () => {
  const fechas = fechasProgramadas({
    dias_semana: 'LUN,MIE', hora: '08:30', fecha_inicio: '2026-11-16', fecha_fin: '2026-11-22'
  }, '2026-11-16', '2026-11-22');
  assert.deepEqual(fechas.map((fecha) => fecha.getDay()), [1, 3]);
  assert.ok(fechas.every((fecha) => fecha.getHours() === 8 && fecha.getMinutes() === 30));
});

test('respeta el inicio y fin del recordatorio', () => {
  const fechas = fechasProgramadas({
    dias_semana: 'LUN,MAR,MIE,JUE,VIE,SAB,DOM',
    hora: '09:00', fecha_inicio: '2026-11-18', fecha_fin: '2026-11-19'
  }, '2026-11-16', '2026-11-25');
  assert.equal(fechas.length, 2);
  assert.deepEqual(fechas.map((fecha) => fecha.getDate()), [18, 19]);
});

test('rechaza días desconocidos', () => {
  assert.throws(() => fechasProgramadas({
    dias_semana: 'LUN,XYZ', hora: '09:00', fecha_inicio: '2026-11-16'
  }, '2026-11-16', '2026-11-17'), /Los días deben/);
});

test('un paciente no puede actuar como otro usuario', () => {
  const paciente = { id_usuario: 7, roles: ['PACIENTE'] };
  assert.doesNotThrow(() => exigirPropietario(paciente, 7));
  assert.throws(() => exigirPropietario(paciente, 8), /No tiene acceso/);
  assert.doesNotThrow(() => exigirPropietario({ id_usuario: 1, roles: ['ADMIN'] }, 8));
});
