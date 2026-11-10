const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { referencia, fechaValida, rangoFechas } = require('./validaciones');

const noNegativo = (campo) => ({
  isInt: { msg: `${campo} debe ser un número entero` },
  min: { args: [0], msg: `${campo} no puede ser negativo` }
});

const Reporte = sequelize.define('reporte', {
  id_reporte:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: referencia('id_usuario')
  },
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: fechaValida('fecha_inicio')
  },
  fecha_fin: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: fechaValida('fecha_fin')
  },
  total: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: noNegativo('total')
  },
  tomadas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: noNegativo('tomadas')
  },
  omitidas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: noNegativo('omitidas')
  },
  adherencia: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    validate: {
      isFloat: { msg: 'adherencia debe ser un número' },
      min: { args: [0], msg: 'adherencia no puede ser negativa' },
      max: { args: [100], msg: 'adherencia no puede superar 100' }
    }
  },
  fecha_generacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  tableName: 'reporte',
  validate: {
    fechasCoherentes: rangoFechas('fecha_inicio', 'fecha_fin')
  }
});

module.exports = Reporte;
