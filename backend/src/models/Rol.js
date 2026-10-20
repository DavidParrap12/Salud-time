const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rol = sequelize.define('ROL', {
  id_rol: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'ROL'
});

module.exports = Rol;
