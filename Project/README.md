# prueba 1
# prueba 2


# Estructura del Proyecto

```
project/
├── backend/                  # Lógica del servidor y APIs
│   ├── src/
│   │   ├── api/              # Rutas y controladores de las APIs
│   │   │   ├── routes/       # Definición de endpoints
│   │   │   ├── controllers/  # Lógica de entrada para cada endpoint
│   │   │   └── middlewares/  # Validación y autenticación
│   │   ├── core/             # Lógica de negocio
│   │   │   ├── services/     # Funciones reutilizables para lógica avanzada
│   │   │   ├── models/       # Modelos de datos (DTOs, interfaces)
│   │   │   ├── utils/        # Funciones auxiliares comunes
│   │   │   └── constants/    # Constantes reutilizables
│   │   ├── database/         # Conexión y configuraciones de la base de datos
│   │   │   ├── migrations/   # Scripts para migraciones
│   │   │   ├── seeds/        # Datos iniciales de prueba
│   │   │   └── repositories/ # Acceso a datos de PostgreSQL
│   │   ├── config/           # Configuraciones generales
│   │   ├── tests/            # Pruebas unitarias del backend
│   │   └── index.ts          # Punto de entrada del backend
│   ├── package.json          # Dependencias backend
│   └── tsconfig.json         # Configuración TypeScript backend
├── frontend/                 # Lógica del cliente
│   ├── src/
│   │   ├── api/              # Servicios para consumir APIs
│   │   ├── components/       # Componentes reutilizables
│   │   ├── features/         # Módulos y vistas específicas
│   │   ├── hooks/            # Hooks personalizados
│   │   ├── store/            # Gestión del estado global
│   │   ├── styles/           # Estilos globales y variables
│   │   ├── utils/            # Funciones auxiliares
│   │   ├── constants/        # Constantes reutilizables
│   │   └── App.tsx           # Punto de entrada principal
│   ├── public/               # Archivos estáticos
│   ├── package.json          # Dependencias frontend
│   └── tsconfig.json         # Configuración TypeScript frontend
├── scripts/                  # Scripts útiles para tareas automatizadas
├── README.md                 # Documentación del proyecto
├── .env                      # Variables de entorno
└── .gitignore                # Archivos a ignorar por Git
```

## Explicación Detallada

### 1. Backend

#### api/
- **routes/**: Define los endpoints de las APIs de manera modular. Cada archivo representa un módulo (e.g., `auth.routes.ts`, `metrics.routes.ts`).
- **controllers/**: Contienen la lógica principal para cada endpoint. Delega tareas complejas a servicios.
- **middlewares/**: Para validación, autenticación y autorización.

#### core/
- **services/**: Contiene la lógica principal reutilizable, como procesar datos de Git o manejar cálculos estadísticos.
- **models/**: Define interfaces y DTOs para un tipado claro en TypeScript.
- **utils/**: Funciones auxiliares comunes (e.g., formateo de fechas, manejo de errores).
- **constants/**: Constantes globales para rutas de APIs, mensajes de error y configuraciones comunes.

#### database/
- **migrations/**: Scripts para gestionar la estructura de la base de datos.
- **seeds/**: Datos iniciales para pruebas.
- **repositories/**: Métodos específicos para interactuar con la base de datos.

#### config/
- Archivos de configuración para diferentes entornos (e.g., desarrollo, producción).

### 2. Frontend

#### api/
- Define servicios para consumir las APIs del backend, agrupados por funcionalidad (e.g., `auth.service.ts`, `metrics.service.ts`).

#### components/
- Componentes reutilizables como botones, modales, gráficas individuales.

#### features/
- Módulos específicos, cada uno con sus propios componentes, vistas y lógica (e.g., Visualizador, Contribuciones).

#### hooks/
- Hooks personalizados para lógica reutilizable (e.g., manejo de estados de carga, fetch API).

#### store/
- Configuración de Redux y slices para manejar el estado global.

#### styles/
- Archivos de estilo global (e.g., colores, tipografías).

#### constants/
- Define constantes globales para mensajes de error y rutas de APIs.

---

## Flujo de Instalación y Configuración

TODO
