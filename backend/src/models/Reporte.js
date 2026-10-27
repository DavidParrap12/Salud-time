const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reporte = sequelize.define('reporte', {
  id_reporte:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario:       { type: DataTypes.INTEGER, allowNull: false },
  fecha_inicio:     { type: DataTypes.DATEONLY, allowNull: false },
  fecha_fin:        { type: DataTypes.DATEONLY, allowNull: false },
  total:            { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  tomadas:          { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  omitidas:         { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  adherencia:       { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  fecha_generacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  tableName: 'reporte'
});

module.exports = Reporte;
