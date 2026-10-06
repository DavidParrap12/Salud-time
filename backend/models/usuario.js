const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('USUARIO', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_completo: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  telefono: {
  type: DataTypes.STRING(20),
  allowNull: true
},
  correo: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  contrasena_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  edad: {
    type: DataTypes.TINYINT,
    allowNull: false
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