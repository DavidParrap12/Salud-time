const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { textoRequerido, textoOpcional } = require('./validaciones');

const Rol = sequelize.define('ROL', {
  id_rol: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: textoRequerido('nombre', 100)
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: textoOpcional('descripcion', 255)
  }
}, {
  tableName: 'ROL'
});

module.exports = Rol;
