const sequelize = require('../config/database');

const Usuario             = require('./Usuario');
const Rol                 = require('./Rol');
const Especializacion     = require('./Especializacion');
const UsuarioRol          = require('./UsuarioRol');
const MedicoEspecializacion = require('./MedicoEspecializacion');
const Medicamento         = require('./Medicamento');
const Tratamiento         = require('./Tratamiento');
const CuidadorPaciente    = require('./CuidadorPaciente');
const Recordatorio        = require('./Recordatorio');
const DosisProgramada     = require('./DosisProgramada');
const RegistroDosis       = require('./RegistroDosis');
const Notificacion        = require('./Notificacion');

// USUARIO ↔ ROL
Usuario.belongsToMany(Rol, { through: UsuarioRol, foreignKey: 'id_usuario', otherKey: 'id_rol', as: 'roles' });
Rol.belongsToMany(Usuario, { through: UsuarioRol, foreignKey: 'id_rol', otherKey: 'id_usuario', as: 'usuarios' });

// USUARIO ↔ ESPECIALIZACION (médicos)
Usuario.belongsToMany(Especializacion, {
  through: MedicoEspecializacion,
  foreignKey: 'id_usuario',
  otherKey: 'id_especializacion',
  as: 'especializaciones'
});
Especializacion.belongsToMany(Usuario, {
  through: MedicoEspecializacion,
  foreignKey: 'id_especializacion',
  otherKey: 'id_usuario',
  as: 'medicos'
});

// USUARIO (paciente) ↔ USUARIO (cuidador)
Usuario.belongsToMany(Usuario, {
  through: CuidadorPaciente,
  foreignKey: 'id_paciente',
  otherKey: 'id_cuidador',
  as: 'cuidadores'
});
Usuario.belongsToMany(Usuario, {
  through: CuidadorPaciente,
  foreignKey: 'id_cuidador',
  otherKey: 'id_paciente',
  as: 'pacientesACargo'
});

// USUARIO ↔ TRATAMIENTO (paciente)
Usuario.hasMany(Tratamiento, { foreignKey: 'id_paciente', as: 'tratamientos' });
Tratamiento.belongsTo(Usuario, { foreignKey: 'id_paciente', as: 'paciente' });

// USUARIO ↔ TRATAMIENTO (médico)
Usuario.hasMany(Tratamiento, { foreignKey: 'id_medico', as: 'tratamientosPrescritos' });
Tratamiento.belongsTo(Usuario, { foreignKey: 'id_medico', as: 'medico' });

// MEDICAMENTO ↔ TRATAMIENTO
Medicamento.hasMany(Tratamiento, { foreignKey: 'id_medicamento', as: 'tratamientos' });
Tratamiento.belongsTo(Medicamento, { foreignKey: 'id_medicamento', as: 'medicamento' });

// TRATAMIENTO ↔ RECORDATORIO
Tratamiento.hasMany(Recordatorio, { foreignKey: 'id_tratamiento', as: 'recordatorios' });
Recordatorio.belongsTo(Tratamiento, { foreignKey: 'id_tratamiento', as: 'tratamiento' });

// RECORDATORIO ↔ DOSIS_PROGRAMADA
Recordatorio.hasMany(DosisProgramada, { foreignKey: 'id_recordatorio', as: 'dosis' });
DosisProgramada.belongsTo(Recordatorio, { foreignKey: 'id_recordatorio', as: 'recordatorio' });

// DOSIS_PROGRAMADA ↔ REGISTRO_DOSIS (1:1)
DosisProgramada.hasOne(RegistroDosis, { foreignKey: 'id_dosis_programada', as: 'registro' });
RegistroDosis.belongsTo(DosisProgramada, { foreignKey: 'id_dosis_programada', as: 'dosis' });

// DOSIS_PROGRAMADA ↔ NOTIFICACION
DosisProgramada.hasMany(Notificacion, { foreignKey: 'id_dosis_programada', as: 'notificaciones' });
Notificacion.belongsTo(DosisProgramada, { foreignKey: 'id_dosis_programada', as: 'dosis' });

// USUARIO ↔ NOTIFICACION
Usuario.hasMany(Notificacion, { foreignKey: 'id_usuario_destinatario', as: 'notificaciones' });
Notificacion.belongsTo(Usuario, { foreignKey: 'id_usuario_destinatario', as: 'destinatario' });

module.exports = {
  sequelize,
  Usuario, Rol, Especializacion, UsuarioRol, MedicoEspecializacion,
  Medicamento, Tratamiento, CuidadorPaciente,
  Recordatorio, DosisProgramada, RegistroDosis, Notificacion
};