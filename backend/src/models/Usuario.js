const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { textoRequerido, textoOpcional } = require('./validaciones');

const Usuario = sequelize.define('USUARIO', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_completo: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: textoRequerido('nombre_completo', 150)
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: textoOpcional('telefono', 20)
  },
  correo: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      ...textoRequerido('correo', 150),
      isEmail: { msg: 'correo debe ser un correo válido' }
    }
  },
  contrasena_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: textoRequerido('contrasena_hash', 255)
  },
  edad: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    validate: {
      isInt: { msg: 'edad debe ser un número entero' },
      min: { args: [0], msg: 'edad no puede ser negativa' },
      max: { args: [120], msg: 'edad no puede superar los 120 años' }
    }
  },
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  correo_verificado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  fecha_registro: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'USUARIO'
});

module.exports = Usuario;
