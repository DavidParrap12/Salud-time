const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DosisProgramada = sequelize.define('dosis_programada', {
  id_dosis_programada: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_recordatorio:     { type: DataTypes.INTEGER, allowNull: false },
  fecha_hora:          { type: DataTypes.DATE, allowNull: false },
  estado: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'PENDIENTE',
    validate: { isIn: [['PENDIENTE', 'TOMADA', 'OMITIDA', 'POSPUESTA']] }
  }
}, {
  tableName: 'dosis_programada',
  indexes: [{ unique: true, fields: ['id_recordatorio', 'fecha_hora'] }]
});

module.exports = DosisProgramada;