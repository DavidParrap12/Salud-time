const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notificacion = sequelize.define('notificacion', {
  id_notificacion:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_dosis_programada:     { type: DataTypes.INTEGER, allowNull: false },
  id_usuario_destinatario: { type: DataTypes.INTEGER, allowNull: false },
  tipo:                    { type: DataTypes.STRING(50), allowNull: false },
  mensaje:                 { type: DataTypes.STRING(255), allowNull: false },
  fecha_envio:             { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
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