
# Documentación de Funcionalidades para el TFG (Ampliada)

## Funcionalidades Prioritarias

### **1. Visualizador Evolutivo de Código por Usuario (Vista General y Profunda)**

- **Descripción**: Herramienta para analizar la evolución de los archivos de un repositorio. Ofrece una vista inicial en formato de tablero (grid) mostrando las primeras líneas de los archivos con más cambios, ordenados de mayor a menor actividad. Incluye un modo de reproducción (playback) para visualizar cómo crecen o cambian los archivos con el tiempo.
- **Extras**: Filtrado por rama, fecha, o usuario; vista detallada con colores para destacar los cambios línea por línea.
- **Visualización**:
  - Pantalla principal muestra un tablero de miniaturas (grid 4x4 o configurable) con las primeras líneas de los archivos más modificados.
  - Cada miniatura incluye un indicador visual (barra de progreso o porcentaje) mostrando cuántos cambios ha tenido el archivo.
  - En modo playback, los cambios aparecen gradualmente como si se estuvieran "escribiendo en vivo".
  - Al seleccionar un archivo, se abre una vista detallada con:
    - Código coloreado para destacar líneas añadidas, modificadas o eliminadas.
    - Opciones de navegación entre commits o visualización comparativa entre versiones.
- **Casos de Uso**:
  - Identificar las partes más dinámicas de un código.
  - Facilitar la revisión histórica de múltiples archivos a la vez.
- **Tecnologías Necesarias**: GitHub API, React o similar para la interfaz, herramientas de visualización como D3.js.

---

### **2. Análisis Multidimensional de Commits**

- **Descripción**: Visualiza las métricas de commits de forma avanzada, incluyendo frecuencia diaria/semanal, número de líneas modificadas, y relación entre commits y archivos modificados. Podrá valorar un repo completo a la vez o ramas concretas.
- **Visualización**:
  - Gráfica interactiva estilo matriz o barra apilada para claridad:
    - Los días o semanas se agrupan en el eje X, y las barras muestran contribuciones divididas por usuario o archivo.
    - Colores representan ramas o tipos de cambios.
  - Vista adicional de distribución:
    - Un histograma que muestra la cantidad de cambios realizados por usuario en un rango temporal.
  - Filtros: rama, usuario, fecha.
- **Casos de Uso**:
  - Evaluar patrones de trabajo de los estudiantes.
  - Comparar esfuerzos entre participantes en proyectos grupales.
- **Tecnologías Necesarias**: GitHub API para extraer datos, Python/NumPy para análisis, Matplotlib o gráficos interactivos con Plotly.

---

### **3. Mapa de Contribuciones por Archivo**

- **Descripción**: Muestra cuánto ha contribuido cada usuario a cada archivo mediante un mapa visual, teniendo en cuenta merges y cambios realizados en ramas secundarias que llegan a la principal.
- **Visualización**:
  - Diagrama tipo heatmap donde:
    - Los archivos se representan como bloques o nodos.
    - El color indica el nivel de contribución (verde: muchas contribuciones; rojo: pocas contribuciones).
  - Vista por contribuyente:
    - En lugar de conectar ramas, se muestra un desglose por contribuyente al seleccionar un archivo: 
      - Incluye un gráfico de barras con porcentajes de contribución.
      - Opcional: estadísticas detalladas como líneas añadidas/eliminadas.
- **Casos de Uso**:
  - Evaluar equidad en la colaboración grupal.
  - Analizar roles y responsabilidades dentro del equipo.
- **Tecnologías Necesarias**: GitHub API, librerías de visualización como D3.js o Seaborn.

---

### **4. Evolución de Complejidad del Código**

- **Descripción**: Analiza la evolución de la complejidad del código en los archivos del repositorio. Mide métricas como número de funciones, profundidad de bucles, y tamaño promedio de las funciones.
- **Visualización**:
  - Línea de tiempo para cada archivo:
    - Ejes muestran complejidad en función de líneas de código, número de funciones, y anidaciones.
    - Picos de complejidad se destacan en rojo.
  - Vista detallada:
    - Desglose por función con métricas clave (profundidad, tamaño).
    - Sugerencias automáticas para refactorización (ejemplo: reducir funciones largas).
- **Casos de Uso**:
  - Identificar secciones críticas del código que requieren refactorización.
  - Enseñar cómo la complejidad crece con el tiempo y cómo gestionarla.
- **Tecnologías Necesarias**: Análisis estático con herramientas como Radon, GitHub API para acceder al historial de commits.

---

### **5. Historias Visuales de Proyecto**

- **Descripción**: Genera una historia visual animada del proyecto combinando líneas de tiempo de commits, merges, y actividad en ramas. Representa usuarios con avatares e incluye eventos clave.
- **Visualización**:
  - Animación interactiva que combina:
    - Línea de tiempo principal para el proyecto, con eventos como commits, merges y releases marcados como hitos.
    - Avatares que representan a los usuarios; se mueven entre ramas y archivos para mostrar actividad.
    - Resúmenes en burbujas flotantes indicando líneas añadidas o eliminadas en un periodo.
  - Opción de exportar la animación como video o presentación.
- **Casos de Uso**:
  - Documentar y presentar la evolución de un proyecto de forma atractiva.
  - Identificar patrones de colaboración y cambios críticos.
- **Tecnologías Necesarias**: Librerías de animación y gráficos como Chart.js o Three.js.

---

## Funcionalidades Secundarias

### **6. Simulador de Flujo de Trabajo**

- **Descripción**: Simula cómo un equipo trabajó en un repositorio durante un periodo, mostrando visualmente quién hizo qué, cuándo, y cómo las ramas interactúan entre sí.
- **Visualización**:
  - Mapa de ramas y commits:
    - Cada rama representada como una línea curva.
    - Los commits se representan como puntos; se destacan los merges con nodos grandes.
  - Animación:
    - Avances de usuarios y ramas en tiempo real, resaltando conflictos o cuellos de botella.
- **Casos de Uso**:
  - Enseñar flujos de trabajo colaborativos.
  - Diagnosticar problemas de integración o cuellos de botella.
- **Tecnologías Necesarias**: GitHub GraphQL API, herramientas de simulación como Processing.js.

---

### **7. Analizador de Esfuerzo por Línea de Código y Visualizador de Hotspots**

- **Descripción**: Identifica las líneas de código más trabajadas en un proyecto y genera un mapa visual con colores indicando el esfuerzo invertido (líneas más oscuras indican más cambios).
- **Visualización**:
  - Diagrama de calor del archivo:
    - Cada línea de código tiene un color basado en el número de cambios.
    - Colores oscuros indican líneas modificadas frecuentemente.
  - Resumen general del proyecto:
    - Mapas de calor por archivo o directorio.
    - Gráficos circulares mostrando el porcentaje de esfuerzo por usuario.
- **Casos de Uso**:
  - Identificar partes críticas del código.
  - Incentivar buenas prácticas en el desarrollo.
- **Tecnologías Necesarias**: GitHub API, herramientas de análisis de código y visualización como Matplotlib.

---


