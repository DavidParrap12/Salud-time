/**
 * Validaciones reutilizables para los modelos Sequelize.
 *
 * Los DTO validan el JSON de entrada, pero estas reglas protegen la base de
 * datos: se ejecutan antes de INSERT/UPDATE, incluso si algún dato llega por
 * otro camino (scripts, consola, migraciones, etc.).
 */

// Texto obligatorio: no nulo, no vacío, sin espacios solos y con longitud máxima.
const textoRequerido = (campo, max = 255) => ({
  notNull: { msg: `${campo} es obligatorio` },
  notEmpty: { msg: `${campo} no puede estar vacío` },
  len: {
    args: [1, max],
    msg: `${campo} debe tener entre 1 y ${max} caracteres`
  },
  noSoloEspacios(valor) {
    if (typeof valor === 'string' && valor.trim() === '') {
      throw new Error(`${campo} no puede estar vacío`);
    }
  }
});

// Texto opcional: si viene, respeta la longitud máxima.
const textoOpcional = (campo, max = 255) => ({
  len: {
    args: [0, max],
    msg: `${campo} no puede superar los ${max} caracteres`
  }
});

// Clave foránea / identificador: entero positivo.
const referencia = (campo) => ({
  isInt: { msg: `${campo} debe ser un número entero` },
  min: { args: [1], msg: `${campo} debe ser mayor que cero` }
});

// Fecha válida (DATE o DATEONLY).
const fechaValida = (campo) => ({
  isDate: { msg: `${campo} debe ser una fecha válida` }
});

// Hora en formato HH:MM o HH:MM:SS.
const horaValida = (campo) => ({
  notEmpty: { msg: `${campo} no puede estar vacía` },
  is: {
    args: /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/,
    msg: `${campo} debe tener el formato HH:MM o HH:MM:SS`
  }
});

// Verifica que un rango de fechas exista y esté ordenado.
const rangoFechas = (inicio, fin) =>
  function validarRango() {
    const desde = this[inicio];
    const hasta = this[fin];
    if (!desde || !hasta) return;

    const d = new Date(desde);
    const h = new Date(hasta);
    if (Number.isNaN(d.getTime()) || Number.isNaN(h.getTime())) {
      throw new Error(`${inicio} y ${fin} deben ser fechas válidas`);
    }
    if (h < d) throw new Error(`${fin} no puede ser anterior a ${inicio}`);
  };

module.exports = {
  textoRequerido,
  textoOpcional,
  referencia,
  fechaValida,
  horaValida,
  rangoFechas
};
