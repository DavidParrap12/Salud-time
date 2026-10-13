const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recordatorio = sequelize.define('RECORDATORIO', {
  id_recordatorio: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_medicamento: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  hora: {
    type: DataTypes.TIME,
    allowNull: false
  },
  dias_semana: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  fecha_fin: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'RECORDATORIO'
});

module.exports = Recordatorio;