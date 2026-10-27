/**
 * Utilidades de fecha en hora local.
 * Evita el desfase de toISOString() en zonas UTC- (Colombia, por ejemplo).
 */

const dosDigitos = (n) => String(n).padStart(2, '0');

const fechaLocal = (valor) => {
  const d = new Date(valor);
  return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`;
};

const aFechaLocal = (valor, finDelDia = false) => {
  const match = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return new Date(valor);

  return new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    finDelDia ? 23 : 0,
    finDelDia ? 59 : 0,
    finDelDia ? 59 : 0
  );
};

const rangoDelDia = (fecha = new Date()) => {
  const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 0, 0, 0);
  const fin = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 23, 59, 59);
  return { inicio, fin };
};

module.exports = { fechaLocal, aFechaLocal, rangoDelDia };
