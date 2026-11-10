const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { textoRequerido, textoOpcional, fechaValida } = require('./validaciones');

const Medicamento = sequelize.define('medicamento', {
  id_medicamento: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: textoRequerido('nombre', 150)
  },
  presentacion: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: textoOpcional('presentacion', 100)
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: textoOpcional('descripcion', 255)
  },
  fecha_vencimiento: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: fechaValida('fecha_vencimiento')
  },
  estado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
  tableName: 'medicamento',
  indexes: [{ unique: true, fields: ['nombre', 'presentacion'] }]
});

module.exports = Medicamento;
