const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tratamiento = sequelize.define('tratamiento', {
  id_tratamiento: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_paciente:    { type: DataTypes.INTEGER, allowNull: false },
  id_medicamento: { type: DataTypes.INTEGER, allowNull: false },
  id_medico:      { type: DataTypes.INTEGER, allowNull: true },
  dosis:          { type: DataTypes.STRING(100), allowNull: false },
  fecha_inicio:   { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
  fecha_fin:      { type: DataTypes.DATEONLY },
  estado:         { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
  tableName: 'tratamiento'
});

module.exports = Tratamiento;