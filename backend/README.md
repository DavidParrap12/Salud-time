# Salud Time - Backend

API REST en Node.js + Express + Sequelize (PostgreSQL) para la gestión de
tratamientos, recordatorios y dosis de pacientes.

## Requisitos

- Node.js 18 o superior
- PostgreSQL en ejecución
- Base de datos creada (por defecto `saludtime`)

## Puesta en marcha

```powershell
cd backend
npm install
```

1. Cree la base de datos si no existe:

```sql
CREATE DATABASE saludtime;
```

2. Revise la configuración en `backend/.env` (use `.env.example` como guía):

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=saludtime
DB_USER=postgres
DB_PASSWORD=su_contrasena
JWT_SECRET=una_clave_segura
PORT=3000
```

3. Cree las tablas y cargue los datos de demostración:

```powershell
npm run seed
```

> **Atención:** `npm run seed` ejecuta `sync({ force: true })`, es decir,
> elimina y vuelve a crear todas las tablas. Úselo sólo en desarrollo.

4. Inicie el servidor:

```powershell
npm start
```

o con recarga automática:

```powershell
npm run dev
```

La API queda disponible en `http://localhost:3000`.

Compruebe que está viva:

```powershell
curl.exe http://localhost:3000/api/health
```

## Demostración rápida

Con el servidor corriendo en otra terminal:

```powershell
npm run demo
```

El script hace login, consulta medicamentos, calendario, dashboard, confirma
una dosis, genera un reporte y lista las notificaciones del cuidador.

### Usuarios de prueba

| Rol      | Correo                  | Contraseña |
| -------- | ----------------------- | ---------- |
| Paciente | paciente@saludtime.com  | Salud1234  |
| Médico   | medico@saludtime.com    | Salud1234  |
| Cuidador | cuidador@saludtime.com  | Salud1234  |

## Formato de respuesta

```json
{
  "success": true,
  "mensaje": "OK",
  "data": {}
}
```

Los errores usan el mismo formato con `success: false` y `detalles`.

## Endpoints principales

### Autenticación

| Método | Ruta                            | Descripción                    |
| ------ | ------------------------------- | ------------------------------ |
| POST   | `/api/auth/registro/paciente`   | Registro de paciente           |
| POST   | `/api/auth/registro/especialista` | Registro de médico           |
| POST   | `/api/auth/login`               | Login (devuelve JWT)           |
| POST   | `/api/auth/recuperar-password`  | Solicitud de recuperación      |

### Catálogos

| Método | Ruta                                  | Descripción                    |
| ------ | ------------------------------------- | ------------------------------ |
| GET    | `/api/especializaciones`              | Lista de especializaciones     |
| GET    | `/api/roles`                          | Lista de roles                 |
| GET    | `/api/roles/:id`                      | Rol por id                     |
| GET    | `/api/medicamentos`                   | Lista de medicamentos          |
| POST   | `/api/medicamentos`                   | Crea medicamento               |
| POST   | `/api/medicamentos/validar`           | Valida datos sin guardar       |
| GET    | `/api/medicamentos/:id`               | Medicamento por id             |
| PUT    | `/api/medicamentos/:id`               | Actualiza medicamento          |
| DELETE | `/api/medicamentos/:id`               | Desactiva medicamento          |
| GET    | `/api/medicamentos/:id/vencimiento`   | Fecha de vencimiento           |

### Usuarios y cuidadores

| Método | Ruta                                      | Descripción                    |
| ------ | ----------------------------------------- | ------------------------------ |
| GET    | `/api/usuarios`                           | Lista de usuarios              |
| GET    | `/api/usuarios/:id`                       | Usuario por id                 |
| PUT    | `/api/usuarios/:id`                       | Actualiza datos personales     |
| DELETE | `/api/usuarios/:id`                       | Desactiva usuario              |
| POST   | `/api/usuarios/:id/roles`                 | Asigna rol                     |
| POST   | `/api/roles/asignar/:id_usuario`          | Asigna rol (controlador roles) |
| GET    | `/api/cuidadores/paciente/:id_paciente`   | Cuidadores de un paciente      |
| POST   | `/api/cuidadores`                         | Crea relación cuidador-paciente|
| PUT    | `/api/cuidadores/:id`                     | Actualiza relación             |
| DELETE | `/api/cuidadores/:id`                     | Elimina relación               |

### Tratamientos y recordatorios

| Método | Ruta                                            | Descripción                  |
| ------ | ----------------------------------------------- | ---------------------------- |
| GET    | `/api/tratamientos/paciente/:id_paciente`       | Tratamientos del paciente    |
| POST   | `/api/tratamientos`                             | Crea tratamiento             |
| GET    | `/api/tratamientos/:id`                         | Tratamiento por id           |
| PUT    | `/api/tratamientos/:id`                         | Actualiza tratamiento        |
| DELETE | `/api/tratamientos/:id`                         | Desactiva tratamiento        |
| GET    | `/api/recordatorios/tratamiento/:id_tratamiento`| Recordatorios del tratamiento|
| POST   | `/api/recordatorios`                            | Crea recordatorio            |
| PUT    | `/api/recordatorios/:id`                        | Actualiza recordatorio       |
| DELETE | `/api/recordatorios/:id`                        | Desactiva recordatorio       |
| PATCH  | `/api/recordatorios/:id/hora`                   | Cambia la hora               |
| PATCH  | `/api/recordatorios/:id/dias`                   | Cambia los días              |

### Dosis, calendario y dashboard

| Método | Ruta                                        | Descripción                     |
| ------ | ------------------------------------------- | ------------------------------- |
| GET    | `/api/dosis/pendientes`                     | Dosis pendientes                |
| POST   | `/api/dosis/:id/confirmar`                  | Marca dosis como tomada         |
| POST   | `/api/dosis/:id/omitir`                     | Marca dosis como omitida        |
| POST   | `/api/dosis/alerta`                         | Genera alerta/notificación      |
| GET    | `/api/calendario/:id_usuario`               | Calendario mensual (`?mes=&anio=`) |
| GET    | `/api/calendario/:id_usuario/fecha`         | Dosis de una fecha (`?fecha=YYYY-MM-DD`) |
| GET    | `/api/calendario/:id_usuario/tomadas`       | Dosis tomadas                   |
| GET    | `/api/calendario/:id_usuario/omitidas`      | Dosis omitidas                  |
| GET    | `/api/calendario/:id_usuario/historial`     | Historial de dosis              |
| GET    | `/api/dashboard/:id_usuario`                | Resumen del día                 |
| GET    | `/api/dashboard/:id_usuario/medicamentos-hoy` | Dosis de hoy                  |
| GET    | `/api/dashboard/:id_usuario/dosis-pendientes` | Pendientes del paciente      |

### Notificaciones y reportes

| Método | Ruta                                    | Descripción                    |
| ------ | --------------------------------------- | ------------------------------ |
| GET    | `/api/notificaciones/usuario/:id_usuario` | Notificaciones del usuario   |
| POST   | `/api/notificaciones`                   | Crea notificación              |
| PATCH  | `/api/notificaciones/:id/leida`         | Marca como leída               |
| POST   | `/api/reportes`                         | Genera reporte de adherencia   |
| GET    | `/api/reportes/:id`                     | Consulta reporte               |
| GET    | `/api/reportes/:id/estadisticas`        | Estadísticas del reporte       |
| GET    | `/api/reportes/:id/cumplimiento`        | Cumplimiento del reporte       |
| POST   | `/api/reportes/compartir`               | Comparte reporte por correo    |

## Ejemplos

### Login

```powershell
$body = @{ correo = "paciente@saludtime.com"; contrasena = "Salud1234" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/auth/login `
  -ContentType "application/json" -Body $body
```

### Confirmar una dosis

```powershell
$body = @{ observaciones = "Tomada con el desayuno" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/dosis/1/confirmar `
  -ContentType "application/json" -Body $body
```

### Calendario del mes

```powershell
Invoke-RestMethod "http://localhost:3000/api/calendario/1?mes=10&anio=2026"
```

## Estructura

```
backend/
├── server.js              # Punto de entrada
├── seed.js                # Crea tablas y datos de demostración
├── demo.js                # Demostración automática de la API
└── src/
    ├── config/database.js
    ├── controllers/       # Reciben HTTP, usan DTOs y responden
    ├── dtos/              # Validación y forma de entrada/salida
    ├── models/            # Modelos Sequelize
    ├── routes/            # Definición de rutas
    └── views/response.js  # Formato uniforme de respuestas
```

## Pendientes recomendados

- Agregar middleware de autenticación que valide el JWT en rutas protegidas.
- Implementar el envío real de correos (recuperación de contraseña y reportes).
- Completar los endpoints de estadísticas y cumplimiento de reportes.
- Agregar pruebas automatizadas (Jest/Supertest).
- No versionar `.env`; usar `.env.example` y variables del entorno.
