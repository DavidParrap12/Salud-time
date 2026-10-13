const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Medicamento = sequelize.define('medicamento', {
  id_medicamento: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre:         { type: DataTypes.STRING(150), allowNull: false },
  presentacion:   { type: DataTypes.STRING(100) },
  descripcion:    { type: DataTypes.STRING(255) },
  estado:         { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
  tableName: 'medicamento',
  indexes: [{ unique: true, fields: ['nombre', 'presentacion'] }]
});

module.exports = Medicamento;