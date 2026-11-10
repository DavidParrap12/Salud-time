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

## Verificación de los datos en PostgreSQL

Además de validar el JSON de entrada, los datos se validan antes de guardarse
y se comprueba la integridad de lo que ya está almacenado:

```powershell
npm run verify:db
```

`npm run verify:db` ejecuta `scripts/verificar-bd.js` y realiza **24 controles**:

- Consultas SQL sobre las tablas reales: campos obligatorios no vacíos,
  correos con formato válido, edades en rango, fechas coherentes, estados
  permitidos, claves foráneas existentes y registros duplicados.
- Intentos de escritura con datos inválidos dentro de transacciones que
  siempre se revierten: correo inválido, edad fuera de rango, nombre vacío,
  rango de fechas invertido, adherencia mayor a 100 y estado desconocido.
  Cada intento debe ser rechazado por las validaciones del modelo.

Salida esperada:

```text
============================================================
Resultado: 24/24 controles correctos
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

## Autenticación y Seguridad con JWT

La API protege todas las rutas del sistema consumiendo y validando tokens **JWT (JSON Web Tokens)**:

1. **Obtención del token:** Al iniciar sesión en `POST /api/auth/login`, la API genera y retorna un token JWT firmado con `JWT_SECRET` que contiene la identidad y los roles del usuario.
2. **Consumo del token:** Todas las rutas protegidas (`/api/medicamentos`, `/api/tratamientos`, `/api/dosis`, `/api/reportes`, etc.) requieren el encabezado:
   ```http
   Authorization: Bearer <su_token_jwt>
   ```
3. **Validación automática:**
   - Si no se envía el token o es inválido/expirado, la API responde de inmediato con `401 Unauthorized`.
   - Se comprueba en PostgreSQL que el usuario exista y siga activo (`estado: true`).
   - El adaptador HTTP inyecta el usuario autenticado (`{ usuario }`) en el controlador, manteniendo los controladores 100% libres de `req` y `res`.

Además, la consola del servidor cuenta con un **visualizador de flujo HTTP en tiempo real** (`flowLogger`) que imprime con colores cada petición entrante, parámetros, status HTTP devuelto y tiempo de respuesta en milisegundos.

## Arquitectura y capas

El backend separa responsabilidades para que cada archivo tenga una única
tarea. En particular, **los controllers no reciben `req` ni `res`**.

```text
Petición HTTP
   ↓
server.js                    ← Monta cada router bajo su prefijo (/api/...)
   ↓
src/http/endpoint.js         ← ÚNICO lugar con req/res:
                                • lee body/query,
                                • construye y valida los DTOs de entrada,
                                • llama al controller con { body, params, query },
                                • escribe la respuesta JSON.
   ↓
controllers/                 ← Endpoints + orquestación de casos de uso
   ↓
dtos/                        ← Request DTOs (validan la entrada)
                                Response DTOs (lista blanca de la salida)
   ↓
models/                      ← Sequelize + validaciones antes de escribir en PostgreSQL
   ↓
PostgreSQL
```

### Distribución de responsabilidades

1. **`models/` (persistencia y validación de datos):**
   - Define tablas, tipos, restricciones y asociaciones de Sequelize.
   - `models/validaciones.js` centraliza reglas reutilizables: texto requerido,
     longitudes máximas, referencias enteras positivas, fechas, horas y rangos
     de fechas coherentes.
   - Estas validaciones se ejecutan **antes de INSERT/UPDATE**, aunque el dato
     no venga de la API. Las restricciones `NOT NULL`, `UNIQUE`, claves
     foráneas e índices siguen aplicándose en PostgreSQL.

2. **`controllers/` (endpoints y orquestación):**
   - Cada controller declara sus propios endpoints con su `router`.
   - Sus funciones reciben un objeto plano `{ body, params, query }` ya
     validado por los DTOs. No usan `req` ni `res` ni escriben respuestas.
   - Devuelven `ok(data, mensaje)` o `created(data, mensaje)`; el adaptador
     HTTP se encarga del status y del JSON.
   - Lanzan errores de dominio (`NotFoundError`, `ConflictError`, etc.) y el
     middleware global los traduce a códigos HTTP.

3. **`src/http/endpoint.js` (adaptador HTTP):**
   - Único punto que conoce `req` y `res`.
   - Recibe el handler del controller y, opcionalmente, los DTOs de `body` y
     `query`:

   ```js
   router.post('/', endpoint(crear, { body: CrearMedicamentoDTO }));
   router.get('/pendientes', endpoint(listarPendientes, { query: DosisPendientesQueryDTO }));
   ```

4. **`dtos/` (entrada y salida):**
   - **Request DTOs (`*DTO.js`):** validan formato y tipos del JSON recibido.
   - **Response DTOs (`*ResponseDTO.js`):** definen la lista blanca de campos
     que se entregan al cliente y ocultan datos sensibles como
     `contrasena_hash`.

5. **`validaciones/`:** motor declarativo que usan los DTOs (obligatoriedad,
   tipos, longitudes, expresiones regulares y reglas cruzadas).

### Validación de entrada con DTOs

Cada DTO declara sus reglas en `static rules()` y hereda `from()`. El
adaptador las aplica antes de llamar al controller:

```js
router.post('/', endpoint(crear, { body: CrearMedicamentoDTO }));
// endpoint() ejecuta CrearMedicamentoDTO.from(req.body)
// y el controller recibe { body: dto, params, query }.
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

El middleware global también traduce los errores de Sequelize:
`SequelizeValidationError` → `400`, `SequelizeUniqueConstraintError` → `409`,
`SequelizeForeignKeyConstraintError` → `400` y los errores de conexión → `503`.

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

> Todas las rutas (excepto login, registro y health) exigen el encabezado
> `Authorization: Bearer <token>`. Si no se incluye o ha expirado, la API
> responde con código `401 Unauthorized`.

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
│   ├── verificar-http.js        # 41 peticiones HTTP de verificación
│   └── verificar-bd.js          # 24 controles de datos en PostgreSQL
└── src/
    ├── config/database.js
    ├── http/endpoint.js         # Adaptador HTTP (único con req/res)
    ├── controllers/             # Endpoints + orquestación, sin req/res
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
    ├── models/                  # Modelos Sequelize, asociaciones y validaciones
    ├── docs/openapi.js          # Especificación Swagger (/docs)
    ├── utils/
    │   ├── fechas.js            # Fechas en hora local
    │   └── transaccion.js       # Transacciones administradas
    └── views/response.js        # Resultados ok()/created() de los controllers
```

## Pendientes recomendados

- Agregar middleware de autenticación que valide el JWT en rutas protegidas.
- Implementar el envío real de correos (recuperación de contraseña y reportes).
- Agregar pruebas automatizadas con Jest/Supertest además de la verificación HTTP.
- Agregar límite de intentos de login y otros controles de seguridad.
- No versionar `.env`; usar `.env.example` y variables del entorno.
