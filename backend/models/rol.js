const {dataTypes} = require('sequelize');
const sequelize = require('../config/database');

const Rol = sequelize.define('ROL', {
  id_rol: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_rol: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'ROL'
});

module.exports = Rol;
