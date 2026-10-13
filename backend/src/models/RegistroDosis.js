const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RegistroDosis = sequelize.define('registro_dosis', {
  id_registro_dosis:   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_dosis_programada: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  fecha_confirmacion:  { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  observaciones:       { type: DataTypes.STRING(255) }
}, {
  tableName: 'registro_dosis'
});

module.exports = RegistroDosis;