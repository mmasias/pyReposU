# Justificación de las Elecciones

## 1. Frontend: Visualización y Experiencia del Usuario

### Framework: React
React fue elegido porque:
- Su modularidad facilita la creación de componentes reutilizables para las visualizaciones.
- Posee una amplia comunidad y ecosistema, con soporte robusto para TypeScript.

### Bibliotecas de Visualización
1. **D3.js**:
   - Ofrece control absoluto sobre los gráficos y animaciones.
   - Es ideal para crear visualizaciones complejas como las requeridas en este proyecto (tiles dinámicos, playback, heatmaps).

2. **diff2html**:
   - Diseñado específicamente para resaltar diferencias en el código, como las vistas de GitHub.
   - Su integración con React es sencilla, lo que lo hace perfecto para la vista de cambios.

3. **Highcharts**:
   - Excelente para gráficos básicos y rápidos, como mapas de calor y burbujas.
   - Se utilizará inicialmente para reducir la complejidad técnica del MVP.

### Animaciones: React-Spring
- React-Spring fue seleccionado por su capacidad de manejar animaciones suaves y basadas en física, perfectas para transiciones complejas.

### Estilos: Tailwind CSS y Ant Design
- **Tailwind CSS**:
  - Permite desarrollar estilos rápidamente con una sintaxis intuitiva.
  - Ideal para personalización rápida en proyectos dinámicos.
- **Ant Design**:
  - Facilita el desarrollo de formularios y tablas con componentes predefinidos.

---

## 2. Backend: Procesamiento y API

### Lenguaje y Framework
1. **Node.js con TypeScript**:
   - El tipado fuerte de TypeScript mejora la mantenibilidad del código.
   - Node.js es asíncrono y perfecto para manejar las operaciones de Git y archivos.

2. **Express.js**:
   - Ligero, sencillo y ampliamente usado para construir APIs RESTful.

### Librerías Clave
1. **Simple-Git**:
   - Abstrae las operaciones de Git en Node.js, facilitando tareas como `git log` o `git diff`.

2. **fs/promises**:
   - Nativa en Node.js, permite manejar datos en archivos de manera eficiente.

3. **class-transformer**:
   - Simplifica la validación y transformación de datos en TypeScript.

---

## 3. Base de Datos

### PostgreSQL con DBeaver
PostgreSQL fue seleccionado porque:
- Es altamente escalable y soporta consultas complejas.
- Posee integridad transaccional, útil para métricas críticas.

DBeaver será la herramienta de administración debido a su interfaz amigable y capacidades avanzadas. Además la he usado con anterioridad.

### Consideración Inicial
El sistema se desarrollará inicialmente sin base de datos para reducir complejidad en la fase de diseño. La integración con PostgreSQL será opcional, activándose según las necesidades de rendimiento o escalabilidad.

---

## 4. Herramientas de Desarrollo

### Control de Versión: GitHub
- Permite gestionar tareas, ramas y automatizaciones en un solo lugar.
- GitHub Actions simplifica la integración continua (CI/CD).

### Calidad del Código
1. **ESLint**:
   - Garantiza un estilo de código limpio y libre de errores.
2. **Prettier**:
   - Facilita el formateo uniforme del código, reduciendo conflictos.

### Pruebas
1. **Jest**:
   - Amplia comunidad, fácil configuración y perfecta para TypeScript.
2. **Cypress**:
   - Ideal para probar flujos de usuario de extremo a extremo.

### Bundler: Vite
- Rápido y moderno, diseñado para proyectos React con TypeScript.

### Variables de Entorno: dotenv
- Facilita la configuración de rutas y claves sensibles sin exponerlas en el código fuente.
