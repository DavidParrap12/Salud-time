const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Especializacion = sequelize.define('ESPECIALIZACION', {
  id_especializacion: {
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
  tableName: 'ESPECIALIZACION'
});

module.exports = Especializacion;