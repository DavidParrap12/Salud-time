const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { textoRequerido, referencia } = require('./validaciones');

const Notificacion = sequelize.define('notificacion', {
  id_notificacion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_dosis_programada: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: referencia('id_dosis_programada')
  },
  id_usuario_destinatario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: referencia('id_usuario_destinatario')
  },
  tipo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: textoRequerido('tipo', 50)
  },
  mensaje: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: textoRequerido('mensaje', 255)
  },
  fecha_envio: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  estado: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'PENDIENTE',
    validate: { isIn: [['PENDIENTE', 'ENVIADA', 'LEIDA', 'FALLIDA']] }
  }
}, {
  tableName: 'notificacion'
});

module.exports = Notificacion;
