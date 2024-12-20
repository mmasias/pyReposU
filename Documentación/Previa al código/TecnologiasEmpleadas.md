# Tecnologías a Emplear

## 1. Frontend: Visualización y Experiencia del Usuario

### Framework
- **React**: Se utilizará como framework base para el desarrollo del frontend debido a su modularidad y su capacidad de integrar bibliotecas modernas.

### Bibliotecas de Visualización
- **D3.js**: Para personalizar gráficos y animaciones complejas como tiles, playback, burbujas y heatmaps.
- **diff2html**: Para representación visual estática de diferencias de código, al estilo de GitHub.
- **Highcharts**: Para gráficos iniciales más sencillos, como mapas de calor y burbujas. Se evaluará migrar completamente a D3.js una vez validados los requisitos.

### Animaciones
- **React-Spring**: Para gestionar transiciones suaves y fluidas en las vistas.

### Estilos
- **Tailwind CSS**: Framework de utilidad para desarrollar estilos rápidos y consistentes.
- **Ant Design**: Biblioteca de componentes para formularios y tablas.

### Estado Global
- **Redux Toolkit**: Para gestionar el estado compartido entre componentes React.

---

## 2. Backend: Procesamiento y API

### Lenguaje y Framework
- **Node.js con TypeScript**: Se empleará para el desarrollo del backend debido a su flexibilidad y capacidades asíncronas.
- **Express.js**: Framework ligero para gestionar las rutas y lógica de las APIs.

### Librerías Clave
1. **Simple-Git**: Para interactuar con repositorios locales y ejecutar comandos de Git.
2. **fs/promises**: Para manejo eficiente de archivos y datos JSON.
3. **class-transformer**: Para validar y estructurar datos antes de enviarlos al frontend.

---

## 3. Base de Datos

### Sistema de Gestión
- **PostgreSQL**: Base de datos relacional elegida por su robustez y escalabilidad. Se administrará mediante **DBeaver**, dado que es una herramienta conocida y eficiente para el manejo de bases de datos.

### Consideración Inicial
El framework se diseñará inicialmente para funcionar sin base de datos (procesando datos en memoria o con archivos JSON). Sin embargo, se dejará abierta la opción de integrar PostgreSQL para mejorar el rendimiento y soportar grandes repositorios.

---

## 4. Herramientas de Desarrollo

### Control de Versión
- **GitHub**: Gestión del repositorio, tableros y automatización con GitHub Actions.

### Calidad del Código
- **ESLint**: Para mantener un estilo de código consistente.
- **Prettier**: Para formateo automático del código.

### Pruebas
- **Jest**: Pruebas unitarias para backend y lógica del frontend.
- **Cypress**: Pruebas end-to-end para flujos de usuario.

### Bundler
- **Vite**: Herramienta rápida para el empaquetado y desarrollo del frontend.

### Variables de Entorno
- **dotenv**: Para gestionar configuraciones sensibles como rutas y claves.
