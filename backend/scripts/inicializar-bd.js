/** Crea únicamente las tablas y roles que falten; conserva los registros existentes. */
const { sequelize, Rol } = require('../src/models');

async function main() {
  await sequelize.authenticate();
  await sequelize.sync();
  for (const [nombre, descripcion] of [
    ['PACIENTE', 'Usuario que recibe el tratamiento'],
    ['MEDICO', 'Profesional que prescribe tratamientos'],
    ['CUIDADOR', 'Persona que acompaña al paciente'],
    ['ADMIN', 'Administrador de usuarios y roles']
  ]) {
    await Rol.findOrCreate({ where: { nombre }, defaults: { descripcion } });
  }
  console.log('Base de datos inicializada sin borrar registros.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => sequelize.close());
