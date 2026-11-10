const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { referencia, textoOpcional } = require('./validaciones');

const cuidadorPaciente = sequelize.define('cuidador_paciente', {
  id_cuidador_paciente: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_paciente: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: referencia('id_paciente')
  },
  id_cuidador: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: referencia('id_cuidador')
  },
  parentesco: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: textoOpcional('parentesco', 50)
  },
  estado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
  tableName: 'cuidador_paciente',
  indexes: [{ unique: true, fields: ['id_paciente', 'id_cuidador'] }],
  validate: {
    noEsElMismo() {
      if (this.id_paciente === this.id_cuidador) {
        throw new Error('El cuidador no puede ser el mismo paciente');
      }
    }
  }
});

module.exports = cuidadorPaciente;
