const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const {
  textoRequerido,
  referencia,
  fechaValida,
  horaValida,
  rangoFechas
} = require('./validaciones');

const Recordatorio = sequelize.define('RECORDATORIO', {
  id_recordatorio: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_tratamiento: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: referencia('id_tratamiento')
  },
  hora: {
    type: DataTypes.TIME,
    allowNull: false,
    validate: horaValida('hora')
  },
  dias_semana: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: textoRequerido('dias_semana', 50)
  },
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: fechaValida('fecha_inicio')
  },
  fecha_fin: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: fechaValida('fecha_fin')
  },
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'RECORDATORIO',
  validate: {
    fechasCoherentes: rangoFechas('fecha_inicio', 'fecha_fin')
  }
});

module.exports = Recordatorio;
