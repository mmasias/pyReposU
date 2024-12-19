# Casos de uso a desarrollar en el proyecto.

## **1. Visualizador Evolutivo de Código por Carpeta y Archivos**

### **Descripción**
- Herramienta para analizar la evolución de las carpetas y los archivos de un repositorio. Permite observar cómo las carpetas y sus respectivos archivos han cambiado a lo largo del tiempo, tanto a nivel general como detallado.
- Ofrece un modo de reproducción (playback) para visualizar los cambios gradualmente commit a commit.

### **Visualización**
- **Vista General:**
  - Representa las carpetas como bloques principales (tiles) dentro de un tablero (grid).
  - Cada carpeta muestra indicadores de actividad (cambios totales) y subtiles para los archivos más relevantes dentro de esa carpeta.
  - Los indicadores visuales incluyen:
    - Barras de progreso para mostrar la cantidad de cambios.
    - Porcentaje del total de cambios para cada archivo dentro de la carpeta.
- **Vista Detallada:**
  - Al seleccionar una carpeta, muestra una lista con los archivos que contiene, ordenados por actividad.
  - Cada archivo incluye:
    - Código coloreado para destacar líneas añadidas, eliminadas o modificadas.
    - Comparación entre diferentes versiones del archivo.
  - Playback para observar los cambios en el tiempo.

### **Casos de Uso**
- Evaluar cómo se distribuye el trabajo entre carpetas y archivos.
- Identificar archivos críticos que recibieron muchos cambios.

### **Extras**
- Filtros para rama, usuario, y rango temporal.
- Exportar estadísticas por carpeta y archivo.

---

## **2. Mapa de Contribuciones por Carpeta y Archivos**

### **Descripción**
- Herramienta que representa visualmente cuánto ha contribuido cada usuario a cada carpeta y archivo del repositorio.
- Incluye una jerarquía que parte de las carpetas principales y se desglosa en los archivos.

### **Visualización**
- **Mapa General:**
  - Cada carpeta se muestra como un bloque en un heatmap.
  - Los colores indican el nivel de contribución de los usuarios (verde: alta contribución, rojo: baja contribución).
  - Los archivos dentro de cada carpeta también se destacan con un gradiente basado en la cantidad de contribuciones.
- **Vista Comparativa:**
  - Al seleccionar una carpeta o archivo, aparece un desglose que muestra:
    - Porcentaje de contribuciones por usuario.
    - Estadísticas detalladas como líneas añadidas, eliminadas, y modificadas por cada contribuyente.

### **Casos de Uso**
- Analizar qué usuarios trabajaron en qué partes del repositorio.
- Identificar la equidad en el trabajo entre miembros de un equipo.

### **Extras**
- Permite filtrar por rama, usuario, y rango temporal.
- Comparaciones entre ramas para ver si los cambios en ramas secundarias impactaron correctamente en la principal.

---

## **3. Análisis Multidimensional de Commits en Formato Tabla**

### **Descripción**
- Tabla dinámica que muestra métricas clave de contribución para usuarios del repositorio.
- Incluye commits, líneas añadidas/eliminadas, PRs, issues, y comentarios, considerando tanto la rama principal como los orígenes de los cambios.

### **Visualización**
- **Estructura de la Tabla:**
  - Columnas:
    - Usuario.
    - Total de contribuciones.
    - Commits realizados.
    - Líneas añadidas y eliminadas.
    - Pull Requests (PRs).
    - Issues creados.
    - Comentarios en PRs, issues, y commits.
  - Filas:
    - Cada fila representa a un usuario y sus métricas específicas.
- **Detalles Avanzados:**
  - Al seleccionar una fila (usuario), se puede desplegar un subpanel con:
    - Actividad por ramas específicas.
    - Cambios realizados en ramas secundarias que impactaron en la principal.
    - Distribución de los cambios por tipo (código, comentarios, issues).

### **Casos de Uso**
- Evaluar el impacto y tipo de contribuciones realizadas por cada miembro del equipo.
- Identificar usuarios clave en la gestión de issues o PRs.

### **Extras**
- Posibilidad de filtrar por rama (principal, secundaria, o todas juntas).
- Exportar datos en formato CSV o Excel para análisis externos.

