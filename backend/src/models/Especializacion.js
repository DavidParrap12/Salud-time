const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { textoRequerido, textoOpcional } = require('./validaciones');

const Especializacion = sequelize.define('ESPECIALIZACION', {
  id_especializacion: {
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
  tableName: 'ESPECIALIZACION'
});

module.exports = Especializacion;
