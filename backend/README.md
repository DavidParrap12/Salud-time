# Salud Time - Backend

API REST en Node.js + Express + Sequelize (PostgreSQL) para la gestión de
tratamientos, recordatorios, dosis y reportes de adherencia de pacientes.

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

Compruebe que está viva (API + base de datos):

```powershell
curl.exe http://localhost:3000/api/health
```

```json
{ "success": true, "mensaje": "API y base de datos conectadas" }
```

## Verificación automática de las peticiones HTTP

Con el servidor corriendo en otra terminal:

```powershell
npm run seed      # datos limpios (opcional, recomendado)
npm run verify
```

`npm run verify` ejecuta `scripts/verificar-http.js` y hace **41 peticiones
HTTP reales** contra la API. Comprueba respuestas correctas (`200`, `201`) y
errores controlados (`400`, `401`, `404`, `409`).

Salida esperada:

```text
============================================================
Resultado: 41/41 pruebas correctas
Todas las peticiones HTTP respondieron como se esperaba.
```

Si alguna prueba falla, el script muestra la ruta, el código recibido y el
cuerpo de la respuesta, y termina con código de salida `1`.

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

## Documentación Interactiva (Swagger / Estilo FastAPI)

Al igual que en **FastAPI**, la API cuenta con una interfaz interactiva de documentación y prueba en tiempo real basada en **OpenAPI / Swagger UI**:

- **Swagger UI (Interactivo):** [http://localhost:3000/docs](http://localhost:3000/docs) (o `http://localhost:3000/api/docs`)
- **Especificación OpenAPI (JSON):** `http://localhost:3000/api/openapi.json`

Desde `/docs` es posible:
- Explorar todos los endpoints agrupados por módulo.
- Ver los esquemas JSON de los DTOs de entrada y salida.
- Probar peticiones en vivo directamente desde el navegador ("Try it out").

Además, la consola del servidor cuenta con un **visualizador de flujo HTTP en tiempo real** (`flowLogger`) que imprime con colores cada petición entrante, parámetros, status HTTP devuelto y tiempo de respuesta en milisegundos.

## Arquitectura Modelo-Vista-Controlador (MVC) y Capas

El backend está organizado separando responsabilidades en carpetas dedicadas:

```text
Petición HTTP
   ↓
controllers/                  ← Endpoints y orquestación del flujo HTTP
   ↓
validaciones/                 ← Condiciones y reglas de validación (formatos, tipos, restricciones)
   ↓
dtos/                         ← Molde y estructura de datos:
                                • Request DTOs (req): estructuran datos entrantes
                                • Response DTOs (res): estructuran datos salientes
   ↓
models/                       ← Modelado de la base de datos (PostgreSQL + Sequelize)
   ↓
views/response.js             ← Formato estandarizado de respuesta HTTP (JSON)
```

### Distribución de responsabilidades por carpeta:

1. **`models/` (Modelado de Base de Datos):**
   - Contiene la definición de tablas, tipos de columnas, restricciones y asociaciones/relaciones de Sequelize (`belongsToMany`, `hasMany`, `belongsTo`) sobre PostgreSQL.
   - Ningún modelo valida peticiones HTTP ni conoce formatos de entrada o salida.

2. **`controllers/` (Endpoints y Orquestación HTTP):**
   - Cada controlador contiene sus propios endpoints (`router.get`, `router.post`, etc.).
   - Recibe la petición HTTP (`req`), valida parámetros de ruta (`:id`) y query strings.
   - Orquesta el flujo: invoca validaciones, mapea al DTO de entrada, interactúa con los modelos y responde mediante el DTO de salida con el código HTTP correspondiente (`200`, `201`, `400`, `404`).

3. **`dtos/` (Req y Res):**
   - **Request DTOs (`*DTO.js` / req):** Estructuran, tipan y limpian los datos que llegan en la petición (`req.body`, `req.query`).
   - **Response DTOs (`*ResponseDTO.js` / res):** Definen la lista blanca de campos que se entregan al cliente, protegiendo campos sensibles como hashes de contraseña.

4. **`validaciones/` (Condiciones de Validación):**
   - Carpeta dedicada donde residen las reglas y condiciones (`authValidaciones.js`, `medicamentoValidaciones.js`, etc.): obligatoriedad (`required`), tipos (`string`, `int`, `email`, `date`, `time`), longitudes (`min`, `max`), expresiones regulares y reglas de negocio cruzadas (ej. `fecha_fin >= fecha_inicio`).
   - `validadorBase.js`: Motor que evalúa las condiciones y genera errores de validación (`ValidationError`).

### Validación de entrada con DTOs

Cada DTO declara sus reglas en `static rules()` y hereda `from()`:

```js
const dto = CrearMedicamentoDTO.from(req.body); // lanza ValidationError si falla
```

Ejemplo de reglas:

```js
static rules() {
  return {
    nombre: {
      required: true,
      type: 'string',
      min: 2,
      max: 150,
      message: 'El nombre del medicamento es obligatorio'
    },
    fecha_vencimiento: {
      type: 'date',
      message: 'La fecha de vencimiento debe tener formato YYYY-MM-DD'
    }
  };
}
```

Reglas disponibles en `BaseDTO`: `required`, `type` (`string`, `email`,
`int`, `number`, `boolean`, `date`, `time`, `array`, `enum`), `min`, `max`,
`regex`, `values` y `validate` (función personalizada). Las reglas cruzadas
(fecha fin ≥ fecha inicio, campos mínimos en una actualización) se declaran
en `validarReglasCruzadas()`.

Las fechas se validan de forma estricta: `YYYY-MM-DD` y fecha real (por
ejemplo, `2026-02-31` se rechaza). Las horas aceptan `HH:MM` o `HH:MM:SS`.

Respuesta cuando la entrada no es válida:

```json
{
  "success": false,
  "mensaje": "Datos inválidos",
  "detalles": [
    "El nombre del medicamento es obligatorio (entre 2 y 150 caracteres)"
  ]
}
```

### Validación de salida con DTOs

Cada DTO de salida declara `static fields` y `BaseResponseDTO` copia sólo
esos campos. Así se evita filtrar columnas internas como `contrasena_hash` y
se detecta si falta un campo antes de responder:

```js
class UsuarioResponseDTO extends BaseResponseDTO {
  static fields = [
    'id_usuario',
    'nombre_completo',
    'correo',
    'edad',
    'telefono',
    'estado',
    'correo_verificado',
    'fecha_registro'
  ];
}
```

### Errores y códigos HTTP

| Clase               | Status | Uso                                      |
| ------------------- | ------ | ---------------------------------------- |
| `ValidationError`   | 400    | Datos de entrada inválidos               |
| `BusinessError`     | 400    | Regla de negocio incumplida              |
| `UnauthorizedError` | 401    | Credenciales incorrectas o cuenta inactiva |
| `NotFoundError`     | 404    | Recurso inexistente                      |
| `ConflictError`     | 409    | Correo o relación ya registrada          |

Además, `validarId()` valida los ids de ruta con `IdParamDTO`; un valor como
`/api/medicamentos/abc` devuelve `400`, no `500` ni `404`.

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

### Servicio

| Método | Ruta          | Descripción                          |
| ------ | ------------- | ------------------------------------ |
| GET    | `/api/health` | Estado de la API y de la base de datos |

### Autenticación

| Método | Ruta                              | Descripción               |
| ------ | --------------------------------- | ------------------------- |
| POST   | `/api/auth/registro/paciente`     | Registro de paciente      |
| POST   | `/api/auth/registro/especialista` | Registro de médico        |
| POST   | `/api/auth/login`                 | Login (devuelve JWT)      |
| POST   | `/api/auth/recuperar-password`    | Solicitud de recuperación |

### Catálogos

| Método | Ruta                                | Descripción               |
| ------ | ----------------------------------- | ------------------------- |
| GET    | `/api/especializaciones`            | Lista de especializaciones |
| GET    | `/api/roles`                        | Lista de roles            |
| GET    | `/api/roles/:id`                    | Rol por id                |
| POST   | `/api/roles/asignar/:id_usuario`    | Asigna rol a un usuario   |

### Usuarios y cuidadores

| Método | Ruta                                      | Descripción                     |
| ------ | ----------------------------------------- | ------------------------------- |
| GET    | `/api/usuarios`                           | Lista de usuarios               |
| GET    | `/api/usuarios/:id`                       | Usuario por id                  |
| PUT    | `/api/usuarios/:id`                       | Actualiza datos personales      |
| DELETE | `/api/usuarios/:id`                       | Desactiva usuario               |
| POST   | `/api/usuarios/:id/roles`                 | Asigna rol                      |
| GET    | `/api/cuidadores/paciente/:id_paciente`   | Cuidadores de un paciente       |
| POST   | `/api/cuidadores`                         | Crea relación cuidador-paciente |
| PUT    | `/api/cuidadores/:id`                     | Actualiza relación              |
| DELETE | `/api/cuidadores/:id`                     | Elimina relación                |

### Medicamentos

| Método | Ruta                                | Descripción               |
| ------ | ----------------------------------- | ------------------------- |
| GET    | `/api/medicamentos`                 | Lista de medicamentos     |
| POST   | `/api/medicamentos`                 | Crea medicamento          |
| POST   | `/api/medicamentos/validar`         | Valida datos sin guardar  |
| GET    | `/api/medicamentos/:id`             | Medicamento por id        |
| PUT    | `/api/medicamentos/:id`             | Actualiza medicamento     |
| DELETE | `/api/medicamentos/:id`             | Desactiva medicamento     |
| GET    | `/api/medicamentos/:id/vencimiento` | Fecha de vencimiento      |

### Tratamientos y recordatorios

| Método | Ruta                                             | Descripción                    |
| ------ | ------------------------------------------------ | ------------------------------ |
| GET    | `/api/tratamientos/paciente/:id_paciente`        | Tratamientos del paciente      |
| POST   | `/api/tratamientos`                              | Crea tratamiento               |
| GET    | `/api/tratamientos/:id`                          | Tratamiento por id             |
| PUT    | `/api/tratamientos/:id`                          | Actualiza tratamiento          |
| DELETE | `/api/tratamientos/:id`                          | Desactiva tratamiento          |
| GET    | `/api/recordatorios/tratamiento/:id_tratamiento` | Recordatorios del tratamiento  |
| POST   | `/api/recordatorios`                             | Crea recordatorio              |
| PUT    | `/api/recordatorios/:id`                         | Actualiza recordatorio         |
| DELETE | `/api/recordatorios/:id`                         | Desactiva recordatorio         |
| PATCH  | `/api/recordatorios/:id/hora`                    | Cambia la hora                 |
| PATCH  | `/api/recordatorios/:id/dias`                    | Cambia los días                |
| PATCH  | `/api/recordatorios/:id/medicamento`             | Explica cómo cambiar medicamento |

### Dosis, calendario y dashboard

| Método | Ruta                                          | Descripción                              |
| ------ | --------------------------------------------- | ---------------------------------------- |
| GET    | `/api/dosis/pendientes`                       | Dosis pendientes (`?id_paciente=`)       |
| POST   | `/api/dosis/:id/confirmar`                    | Marca dosis como tomada                  |
| POST   | `/api/dosis/:id/omitir`                       | Marca dosis como omitida                 |
| POST   | `/api/dosis/alerta`                           | Genera alerta/notificación               |
| GET    | `/api/calendario/:id_usuario`                 | Calendario mensual (`?mes=&anio=`)       |
| GET    | `/api/calendario/:id_usuario/fecha`           | Dosis de una fecha (`?fecha=YYYY-MM-DD`) |
| GET    | `/api/calendario/:id_usuario/tomadas`         | Dosis tomadas                            |
| GET    | `/api/calendario/:id_usuario/omitidas`        | Dosis omitidas                           |
| GET    | `/api/calendario/:id_usuario/historial`       | Historial de dosis                       |
| GET    | `/api/dashboard/:id_usuario`                  | Resumen del día                          |
| GET    | `/api/dashboard/:id_usuario/medicamentos-hoy` | Dosis de hoy                             |
| GET    | `/api/dashboard/:id_usuario/dosis-pendientes` | Pendientes del paciente                  |

### Notificaciones y registros

| Método | Ruta                                      | Descripción                  |
| ------ | ----------------------------------------- | ---------------------------- |
| GET    | `/api/notificaciones/usuario/:id_usuario` | Notificaciones del usuario   |
| POST   | `/api/notificaciones`                     | Crea notificación            |
| PATCH  | `/api/notificaciones/:id/leida`           | Marca como leída             |
| GET    | `/api/registros`                          | Registros (`?id_paciente=`)  |
| GET    | `/api/registros/:id`                      | Registro por id              |

### Reportes

| Método | Ruta                             | Descripción                  |
| ------ | -------------------------------- | ---------------------------- |
| POST   | `/api/reportes`                  | Genera y guarda un reporte   |
| GET    | `/api/reportes/:id`              | Consulta el reporte guardado |
| GET    | `/api/reportes/:id/estadisticas` | Estadísticas del reporte     |
| GET    | `/api/reportes/:id/cumplimiento` | Nivel de cumplimiento       |
| POST   | `/api/reportes/compartir`        | Comparte reporte por correo  |

Los reportes se guardan en la tabla `reporte`, por lo que consultarlos después
devuelve exactamente los mismos datos con los que se generaron.

## Probar la API

### Opción 1: verificación automática

```powershell
npm run verify
```

### Opción 2: Postman

Importe `postman/SaludTime.postman_collection.json`. La colección incluye
variables `baseUrl` y `token`, y guarda el token automáticamente al ejecutar
**Login (ejecutar primero)**. También trae pruebas básicas de status para las
respuestas correctas y los errores `400`, `401` y `404`.

### Opción 3: VS Code REST Client

Abra `api.http` y ejecute primero la petición **1. Login**; el token se toma
automáticamente de la respuesta para las demás peticiones. El archivo incluye
ejemplos de todos los módulos y de los errores esperados.

### Opción 4: PowerShell

```powershell
# Login
$body = @{ correo = "paciente@saludtime.com"; contrasena = "Salud1234" } | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/auth/login `
  -ContentType "application/json" -Body $body
$token = $login.data.token

# Consulta autenticada
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod "http://localhost:3000/api/medicamentos" -Headers $headers

# Confirmar una dosis
$body = @{ observaciones = "Tomada con el desayuno" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/dosis/1/confirmar `
  -Headers $headers -ContentType "application/json" -Body $body
```

> En esta versión el JWT se emite en el login, pero las rutas todavía no
> exigen el encabezado `Authorization`. El middleware de autenticación está
> listado en los pendientes.

## Estructura

```text
backend/
├── server.js                    # Punto de entrada (middlewares globales)
├── seed.js                      # Crea tablas y datos de demostración
├── demo.js                      # Demostración automática de la API
├── api.http                     # Ejemplos para VS Code REST Client
├── postman/
│   └── SaludTime.postman_collection.json
├── scripts/
│   └── verificar-http.js        # 41 peticiones HTTP de verificación
└── src/
    ├── config/database.js
    ├── routes/index.js          # ÚNICO lugar con endpoints
    ├── controllers/             # Orquestan; no validan ni responden errores
    ├── dtos/
    │   ├── BaseDTO.js           # Validación declarativa de entrada
    │   ├── BaseResponseDTO.js   # Lista blanca de campos de salida
    │   └── ...                  # Un DTO por caso de uso
    ├── errors/AppError.js       # Errores de dominio con status HTTP
    ├── middlewares/
    │   ├── asyncHandler.js      # Propaga errores async
    │   ├── errorHandler.js      # Respuesta uniforme de errores
    │   ├── notFound.js          # 404 de rutas inexistentes
    │   └── validarId.js         # Valida ids de ruta con DTO
    ├── models/                  # Modelos Sequelize y asociaciones
    ├── utils/
    │   ├── fechas.js            # Fechas en hora local
    │   └── transaccion.js       # Transacciones administradas
    └── views/response.js        # Formato uniforme de respuestas
```

## Pendientes recomendados

- Agregar middleware de autenticación que valide el JWT en rutas protegidas.
- Implementar el envío real de correos (recuperación de contraseña y reportes).
- Agregar pruebas automatizadas con Jest/Supertest además de la verificación HTTP.
- Agregar límite de intentos de login y otros controles de seguridad.
- No versionar `.env`; usar `.env.example` y variables del entorno.
