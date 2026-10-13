const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UsuarioRol = sequelize.define('USUARIO_ROL', {
  id_usuario_rol: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_rol: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_especializacion: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  fecha_asignacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'USUARIO_ROL'
});

module.exports = UsuarioRol;