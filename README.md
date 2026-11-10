# Salud Time

Aplicación web para el seguimiento de medicamentos y la adherencia a tratamientos.

- **Backend:** Node.js + Express + Sequelize.
- **Base de datos:** PostgreSQL (única fuente de datos).
- **Frontend:** HTML, CSS y JavaScript sin framework. Consume la API por HTTP.

El frontend **no** se conecta a la base de datos: todas las operaciones pasan por la API del backend y este persiste en PostgreSQL.

## Arquitectura

```
Navegador
   │  HTTP (mismo origen)
   ▼
Frontend  http://localhost:4000
   │  proxy /api/*  →  http://localhost:3000
   ▼
Backend   http://localhost:3000
   │  Sequelize
   ▼
PostgreSQL
```

El servidor del frontend sirve los archivos de `frontend/public` y reenvía las peticiones `/api/*` al backend. Así el navegador usa rutas relativas (`/api/...`) y no hay problemas de CORS.

## Requisitos

- Node.js 18 o superior.
- PostgreSQL 14 o superior en ejecución.

## 1. Configurar PostgreSQL

Cree una base de datos, por ejemplo:

```sql
CREATE DATABASE salud_time;
```

## 2. Configurar el backend

```bash
cd backend
npm install
```

Cree `backend/.env` a partir de este ejemplo y ajuste sus credenciales:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=salud_time
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=cambie_esta_clave
PORT=3000
```

Cargue los datos de demostración (esto **elimina y recrea** las tablas):

```bash
npm run seed
```

> `npm run seed` es solo para desarrollo. No lo ejecute sobre una base con datos reales.

## 3. Configurar el frontend

En otra terminal:

```bash
cd frontend
npm install
```

Opcionalmente puede definir variables de entorno:

| Variable        | Valor por defecto        | Descripción                          |
| --------------- | ------------------------ | ------------------------------------ |
| `FRONTEND_PORT` | `4000`                   | Puerto del servidor de archivos.     |
| `API_URL`       | `http://localhost:3000`  | URL interna del backend para el proxy. |

## 4. Ejecutar la aplicación

Terminal 1 — backend:

```bash
cd backend
npm start
```

Terminal 2 — frontend:

```bash
cd frontend
npm start
```

Abra **http://localhost:4000** en el navegador.

## Usuarios de demostración

| Rol      | Correo                  | Contraseña  |
| -------- | ----------------------- | ----------- |
| Paciente | `paciente@saludtime.com` | `Salud1234` |
| Médico   | `medico@saludtime.com`   | `Salud1234` |
| Cuidador | `cuidador@saludtime.com` | `Salud1234` |

## Páginas del frontend

| Página            | Ruta                      | Descripción                                              |
| ----------------- | ------------------------- | -------------------------------------------------------- |
| Inicio de sesión  | `/inicio-sesion/login.html` | Autenticación contra `/api/auth/login`.                |
| Registro          | `/inicio-sesion/registro.html` | Registro de pacientes.                              |
| Panel             | `/principal.html`         | Resumen del día, dosis pendientes y confirmación.        |
| Medicamentos      | `/medicamentos.html`      | Listado, creación, edición y desactivación.              |
| Recordatorios     | `/recordatorios.html`     | Programación de horarios de los tratamientos.            |
| Calendario        | `/calendario.html`        | Vista mensual y detalle de dosis por día.                |
| Reportes          | `/reporte.html`           | Generación, estadísticas, cumplimiento y compartición.   |

## Endpoints principales

La API responde con el formato:

```json
{ "success": true, "data": {}, "mensaje": "..." }
```

Los endpoints protegidos requieren la cabecera:

```
Authorization: Bearer <token>
```

| Método | Ruta                                      | Descripción                              |
| ------ | ----------------------------------------- | ---------------------------------------- |
| POST   | `/api/auth/login`                         | Inicia sesión y devuelve el JWT.         |
| POST   | `/api/auth/registro/paciente`             | Registra un paciente.                    |
| GET    | `/api/dashboard/:id_usuario`              | Resumen del día y dosis.                 |
| GET    | `/api/medicamentos`                       | Lista medicamentos.                      |
| POST   | `/api/medicamentos`                       | Crea un medicamento.                     |
| PUT    | `/api/medicamentos/:id`                   | Actualiza un medicamento.                |
| DELETE | `/api/medicamentos/:id`                   | Desactiva un medicamento.                |
| GET    | `/api/tratamientos/paciente/:id`          | Tratamientos de un paciente.             |
| GET    | `/api/recordatorios/tratamiento/:id`      | Recordatorios de un tratamiento.         |
| POST   | `/api/recordatorios`                      | Crea un recordatorio.                    |
| DELETE | `/api/recordatorios/:id`                  | Desactiva un recordatorio.               |
| POST   | `/api/dosis/:id/confirmar`                | Confirma una dosis pendiente.            |
| GET    | `/api/calendario/:id_usuario?mes=&anio=`  | Dosis agrupadas por día del mes.         |
| GET    | `/api/calendario/:id_usuario/fecha?fecha=` | Dosis de una fecha.                     |
| POST   | `/api/reportes`                           | Genera un reporte de adherencia.         |
| GET    | `/api/reportes/:id/estadisticas`          | Estadísticas del reporte.                |
| GET    | `/api/reportes/:id/cumplimiento`          | Nivel de cumplimiento.                   |
| POST   | `/api/reportes/compartir`                 | Comparte un reporte por correo.          |

## Verificación

Con el backend en ejecución y la base de datos cargada:

```bash
cd backend
npm run verify      # 41 pruebas HTTP
npm run verify:db   # 24 controles sobre PostgreSQL
```

## Estructura del proyecto

```
backend/
  server.js            Arranque, middlewares y montaje de routers
  seed.js              Datos de demostración
  src/
    controllers/       Endpoints y casos de uso
    dtos/              Validación de entrada y formato de salida
    models/            Modelos Sequelize y validaciones
    middlewares/       Autenticación, errores y bitácora de flujo
    http/endpoint.js   Único adaptador HTTP (req/res)
    scripts/           Pruebas de verificación

frontend/
  src/server.js        Servidor estático y proxy /api
  public/
    js/api.js          Cliente de la API, sesión y utilidades
    principal.html     Panel
    medicamentos.html
    recordatorios.html
    calendario.html
    reporte.html
```
