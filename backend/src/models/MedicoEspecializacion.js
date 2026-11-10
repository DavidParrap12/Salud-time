const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { referencia } = require('./validaciones');

const medicoEspecializacion = sequelize.define('medico_especializacion', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    validate: referencia('id_usuario')
  },
  id_especializacion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    validate: referencia('id_especializacion')
  }
}, {
  tableName: 'medico_especializacion'
});

module.exports = medicoEspecializacion;
