/**
 * Especificación OpenAPI 3.0 para la API de Salud Time.
 * Proporciona la documentación interactiva Swagger UI similar a FastAPI en `/docs`.
 */
const openapiSpecification = {
  openapi: '3.0.3',
  info: {
    title: 'Salud Time API',
    description: `
**API REST para Salud Time**

Arquitectura en capas:
- **Controllers**: Contienen los endpoints, validan las peticiones HTTP y orquestan el flujo.
- **DTOs de Entrada**: Verifican y validan la estructura y formato de los JSON recibidos (\`req.body\`).
- **DTOs de Salida**: Verifican, estructuran y limpian los JSON devueltos (ocultando datos sensibles).
- **Modelos / Sequelize**: Acceso y persistencia en PostgreSQL.
- **Documentación Swagger / FastAPI-like**: Visualización interactiva del flujo en \`/docs\`.
    `,
    version: '1.0.0'
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Servidor Local (API)'
    }
  ],
  tags: [
    { name: 'Auth', description: 'Autenticación y registro de usuarios' },
    { name: 'Usuarios', description: 'Gestión y perfil de usuarios' },
    { name: 'Medicamentos', description: 'Catálogo y control de medicamentos' },
    { name: 'Tratamientos', description: 'Tratamientos médicos y recetas' },
    { name: 'Recordatorios', description: 'Configuración de recordatorios horarios' },
    { name: 'Dosis', description: 'Confirmación, omisión y alertas de dosis programadas' },
    { name: 'Calendario', description: 'Visualización de adherencia por fecha y mes' },
    { name: 'Dashboard', description: 'Métricas e información diaria del paciente' },
    { name: 'Notificaciones', description: 'Avisos y alertas enviadas a usuarios/cuidadores' },
    { name: 'Reportes', description: 'Generación y consulta de reportes de adherencia' },
    { name: 'Cuidadores', description: 'Asociación y gestión de cuidadores de pacientes' },
    { name: 'Roles', description: 'Catálogo y asignación de roles' },
    { name: 'Especializaciones', description: 'Catálogo de especializaciones médicas' },
    { name: 'Registros', description: 'Historial de registros de toma de dosis' }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      RespuestaEstandar: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          mensaje: { type: 'string', example: 'Operación exitosa' },
          data: { type: 'object' }
        }
      },
      ErrorValidacion: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          mensaje: { type: 'string', example: 'Datos inválidos' },
          detalles: {
            type: 'array',
            items: { type: 'string' },
            example: ['El correo electrónico no es válido']
          }
        }
      },
      LoginDTO: {
        type: 'object',
        required: ['correo', 'contrasena'],
        properties: {
          correo: { type: 'string', format: 'email', example: 'paciente@saludtime.com' },
          contrasena: { type: 'string', example: 'Salud1234' }
        }
      },
      LoginResponseDTO: {
        type: 'object',
        properties: {
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
          usuario: { $ref: '#/components/schemas/UsuarioResponseDTO' },
          roles: { type: 'array', items: { type: 'string' }, example: ['PACIENTE'] }
        }
      },
      RegistroPacienteDTO: {
        type: 'object',
        required: ['nombre_completo', 'correo', 'contrasena'],
        properties: {
          nombre_completo: { type: 'string', example: 'Carlos Mendoza' },
          correo: { type: 'string', format: 'email', example: 'carlos@ejemplo.com' },
          contrasena: { type: 'string', minLength: 6, example: 'Salud1234' },
          edad: { type: 'integer', example: 34 },
          telefono: { type: 'string', example: '3101234567' }
        }
      },
      UsuarioResponseDTO: {
        type: 'object',
        properties: {
          id_usuario: { type: 'integer', example: 1 },
          nombre_completo: { type: 'string', example: 'Carlos Mendoza' },
          correo: { type: 'string', example: 'carlos@ejemplo.com' },
          edad: { type: 'integer', example: 34 },
          telefono: { type: 'string', example: '3101234567' },
          estado: { type: 'boolean', example: true },
          correo_verificado: { type: 'boolean', example: false },
          fecha_registro: { type: 'string', format: 'date-time' }
        }
      },
      CrearMedicamentoDTO: {
        type: 'object',
        required: ['nombre'],
        properties: {
          nombre: { type: 'string', example: 'Paracetamol 500mg' },
          presentacion: { type: 'string', example: 'Tabletas' },
          descripcion: { type: 'string', example: 'Analgésico y antipirético' },
          fecha_vencimiento: { type: 'string', format: 'date', example: '2027-12-31' }
        }
      },
      MedicamentoResponseDTO: {
        type: 'object',
        properties: {
          id_medicamento: { type: 'integer', example: 1 },
          nombre: { type: 'string', example: 'Paracetamol 500mg' },
          presentacion: { type: 'string', example: 'Tabletas' },
          descripcion: { type: 'string', example: 'Analgésico y antipirético' },
          fecha_vencimiento: { type: 'string', example: '2027-12-31' },
          estado: { type: 'boolean', example: true }
        }
      },
      CrearTratamientoDTO: {
        type: 'object',
        required: ['id_paciente', 'id_medicamento', 'dosis', 'fecha_inicio'],
        properties: {
          id_paciente: { type: 'integer', example: 1 },
          id_medicamento: { type: 'integer', example: 1 },
          id_medico: { type: 'integer', nullable: true, example: 2 },
          dosis: { type: 'string', example: '1 tableta cada 8 horas' },
          fecha_inicio: { type: 'string', format: 'date', example: '2026-10-01' },
          fecha_fin: { type: 'string', format: 'date', nullable: true, example: '2026-10-31' }
        }
      },
      CrearRecordatorioDTO: {
        type: 'object',
        required: ['id_tratamiento', 'hora', 'fecha_inicio'],
        properties: {
          id_tratamiento: { type: 'integer', example: 1 },
          hora: { type: 'string', example: '08:00:00' },
          dias_semana: { type: 'string', example: 'LUN,MIE,VIE' },
          fecha_inicio: { type: 'string', format: 'date', example: '2026-10-01' },
          fecha_fin: { type: 'string', format: 'date', nullable: true, example: '2026-10-31' }
        }
      },
      ConfirmarDosisDTO: {
        type: 'object',
        properties: {
          observaciones: { type: 'string', example: 'Tomada con agua después del desayuno' }
        }
      },
      OmitirDosisDTO: {
        type: 'object',
        required: ['motivo'],
        properties: {
          motivo: { type: 'string', example: 'Malestar estomacal' }
        }
      },
      CrearReporteDTO: {
        type: 'object',
        required: ['id_usuario', 'fecha_inicio', 'fecha_fin'],
        properties: {
          id_usuario: { type: 'integer', example: 1 },
          fecha_inicio: { type: 'string', format: 'date', example: '2026-10-01' },
          fecha_fin: { type: 'string', format: 'date', example: '2026-10-31' }
        }
      }
    }
  },
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesión (Login)',
        description: 'Autentica a un usuario y genera token JWT.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginDTO' } } }
        },
        responses: {
          200: { description: 'Login exitoso' },
          401: { description: 'Credenciales inválidas' }
        }
      }
    },
    '/auth/registro/paciente': {
      post: {
        tags: ['Auth'],
        summary: 'Registro de nuevo paciente',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegistroPacienteDTO' } } }
        },
        responses: {
          201: { description: 'Paciente creado exitosamente' },
          400: { description: 'Datos de entrada inválidos' },
          409: { description: 'El correo ya está registrado' }
        }
      }
    },
    '/usuarios': {
      get: {
        tags: ['Usuarios'],
        summary: 'Listar todos los usuarios activos',
        responses: { 200: { description: 'Listado de usuarios' } }
      }
    },
    '/usuarios/{id}': {
      get: {
        tags: ['Usuarios'],
        summary: 'Obtener usuario por ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Datos del usuario' }, 404: { description: 'No encontrado' } }
      },
      put: {
        tags: ['Usuarios'],
        summary: 'Actualizar información de usuario',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Usuario actualizado' } }
      },
      delete: {
        tags: ['Usuarios'],
        summary: 'Desactivar usuario (Soft delete)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Usuario desactivado' } }
      }
    },
    '/medicamentos': {
      get: {
        tags: ['Medicamentos'],
        summary: 'Listar medicamentos activos',
        responses: { 200: { description: 'Listado de medicamentos' } }
      },
      post: {
        tags: ['Medicamentos'],
        summary: 'Crear nuevo medicamento',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CrearMedicamentoDTO' } } }
        },
        responses: { 201: { description: 'Medicamento registrado' }, 400: { description: 'Datos inválidos' } }
      }
    },
    '/medicamentos/validar': {
      post: {
        tags: ['Medicamentos'],
        summary: 'Validar JSON de medicamento sin persistir',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CrearMedicamentoDTO' } } }
        },
        responses: { 200: { description: 'Resultado de validación' } }
      }
    },
    '/medicamentos/{id}': {
      get: {
        tags: ['Medicamentos'],
        summary: 'Obtener medicamento por ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Medicamento encontrado' }, 404: { description: 'No encontrado' } }
      },
      put: {
        tags: ['Medicamentos'],
        summary: 'Actualizar medicamento',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Actualizado' } }
      },
      delete: {
        tags: ['Medicamentos'],
        summary: 'Desactivar medicamento',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Desactivado' } }
      }
    },
    '/dosis/pendientes': {
      get: {
        tags: ['Dosis'],
        summary: 'Listar dosis pendientes',
        parameters: [{ name: 'id_paciente', in: 'query', schema: { type: 'integer' } }],
        responses: { 200: { description: 'Lista de dosis pendientes' } }
      }
    },
    '/dosis/{id}/confirmar': {
      post: {
        tags: ['Dosis'],
        summary: 'Confirmar toma de dosis',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ConfirmarDosisDTO' } } }
        },
        responses: { 201: { description: 'Dosis confirmada' } }
      }
    },
    '/dosis/{id}/omitir': {
      post: {
        tags: ['Dosis'],
        summary: 'Registrar dosis como omitida',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/OmitirDosisDTO' } } }
        },
        responses: { 201: { description: 'Dosis omitida' } }
      }
    },
    '/dashboard/{id_usuario}': {
      get: {
        tags: ['Dashboard'],
        summary: 'Consultar datos del dashboard de un paciente',
        parameters: [{ name: 'id_usuario', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Resumen diario y dosis de hoy' } }
      }
    },
    '/calendario/{id_usuario}': {
      get: {
        tags: ['Calendario'],
        summary: 'Consultar resumen de adherencia por mes',
        parameters: [
          { name: 'id_usuario', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'mes', in: 'query', required: true, schema: { type: 'integer', minimum: 1, maximum: 12 } },
          { name: 'anio', in: 'query', required: true, schema: { type: 'integer', minimum: 2000 } }
        ],
        responses: { 200: { description: 'Datos del calendario' }, 400: { description: 'Parámetros inválidos' } }
      }
    },
    '/reportes': {
      post: {
        tags: ['Reportes'],
        summary: 'Generar reporte de adherencia por periodo',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CrearReporteDTO' } } }
        },
        responses: { 201: { description: 'Reporte generado' } }
      }
    },
    '/reportes/{id}/estadisticas': {
      get: {
        tags: ['Reportes'],
        summary: 'Estadísticas porcentuales del reporte',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Estadísticas del reporte' } }
      }
    }
  }
};

module.exports = openapiSpecification;
