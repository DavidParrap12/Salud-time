const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MedicoEspecializacion = sequelize.define('medico_especializacion', {
  id_usuario:         { type: DataTypes.INTEGER, primaryKey: true },
  id_especializacion: { type: DataTypes.INTEGER, primaryKey: true }
}, {
  tableName: 'medico_especializacion'
});

module.exports = MedicoEspecializacion;