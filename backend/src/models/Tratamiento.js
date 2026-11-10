const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const {
  textoRequerido,
  referencia,
  fechaValida,
  rangoFechas
} = require('./validaciones');

const Tratamiento = sequelize.define('tratamiento', {
  id_tratamiento: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_paciente: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: referencia('id_paciente')
  },
  id_medicamento: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: referencia('id_medicamento')
  },
  id_medico: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: referencia('id_medico')
  },
  dosis: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: textoRequerido('dosis', 100)
  },
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    validate: fechaValida('fecha_inicio')
  },
  fecha_fin: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: fechaValida('fecha_fin')
  },
  estado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
  tableName: 'tratamiento',
  validate: {
    fechasCoherentes: rangoFechas('fecha_inicio', 'fecha_fin')
  }
});

module.exports = Tratamiento;
