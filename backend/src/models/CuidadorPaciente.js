const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const cuidadorPaciente = sequelize.define('cuidador_paciente', {
  id_cuidador_paciente: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_paciente:          { type: DataTypes.INTEGER, allowNull: false },
  id_cuidador:          { type: DataTypes.INTEGER, allowNull: false },
  parentesco:           { type: DataTypes.STRING(50) },
  estado:               { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
  tableName: 'cuidador_paciente',
  indexes: [{ unique: true, fields: ['id_paciente', 'id_cuidador'] }]
});

module.exports = cuidadorPaciente;