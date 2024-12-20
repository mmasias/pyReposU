# Casos de uso a desarrollar en el proyecto.

## Descripción General
Un sistema para analizar y visualizar estadísticas detalladas de un repositorio de GitHub, ofreciendo herramientas interactivas y visualizaciones avanzadas para evaluar la evolución del código, las contribuciones de usuarios y el impacto de los commits.

El proyecto se desarrolla en TypeScript para backend y frontend. El frontend estará basado en React.

## Casos de Uso

### 1. Visualizador Evolutivo de Código por Carpeta y Archivos

#### Descripción
Analiza la evolución de carpetas y archivos de un repositorio, permitiendo observar cambios gradualmente commit a commit.
Proporciona dos vistas principales:
- **Vista General:** Muestra carpetas como bloques con indicadores de actividad y previsualización de cambios en los archivos más relevantes.
- **Vista Detallada:** Permite explorar cambios específicos en un archivo seleccionado.

#### Visualización

##### Vista General:
- Representación en formato "tiles" de carpetas con indicadores visuales de actividad.
- Ordenación de carpetas según número total de líneas modificadas (añadidas + eliminadas).
- Al expandir una carpeta, muestra archivos con:
  - Previsualización en miniatura del código.
  - Colores que destacan cambios:
    - Sin cambios: fondo claro.
    - Líneas añadidas: color específico (e.g., verde).
    - Líneas eliminadas: color específico (e.g., rojo).
  - Animaciones suaves para transiciones de estados.

##### Vista Detallada:
- Código resaltado para líneas añadidas, eliminadas o modificadas (estilo GitHub).
- Comparación lado a lado de dos commits consecutivos.
- Controles interactivos de reproducción (flechas para avanzar/retroceder entre commits).

#### Casos de Uso
- Evaluar distribución del trabajo en carpetas y archivos.
- Identificar archivos críticos con alta frecuencia de cambios.

#### Extras
- Filtros: rama, usuario, rango temporal.
- Playback animado para ver los cambios a lo largo del tiempo.

### 2. Mapa de Contribuciones por Carpeta y Archivos

#### Descripción
Visualización de las contribuciones de cada usuario, desglosadas por carpetas y archivos, con métricas como líneas añadidas y eliminadas.

#### Visualización

##### Mapa General (Heatmap):
- Representa carpetas como bloques en un mapa de calor.
- Colores indican nivel de contribución de los usuarios:
  - Verde: alta contribución.
  - Rojo: baja contribución.
- Desglose de archivos dentro de carpetas.

##### Vista Comparativa:
- Gráfica interactiva:
  - Eje X: tiempo.
  - Eje Y: usuarios.
  - Burbujas o barras representan cambios clave (commits, líneas añadidas/borradas).
- Hover muestra detalles:
  - Líneas modificadas (añadidas/eliminadas).
  - Archivos específicos afectados.

#### Casos de Uso
- Analizar participación de usuarios en partes del repositorio.
- Identificar periodos críticos con mayor actividad.

#### Extras
- Filtros: rama, usuario, rango temporal.
- Exportación opcional en formato CSV/Excel.

### 3. Análisis Multidimensional de Commits en Formato Tabla

#### Descripción
Tabla interactiva que muestra métricas clave de contribución por usuario.

#### Visualización

##### Estructura:
- Columnas:
  - Usuario.
  - Total de contribuciones.
  - Commits realizados.
  - Líneas añadidas/eliminadas.
  - Pull Requests (PRs).
  - Issues creados.
  - Comentarios en PRs, issues y commits.
- Filas:
  - Cada fila representa un usuario.

##### Detalles:
- Filtros básicos (rama, rango temporal).
- Exportación opcional en formato CSV/Excel.

#### Casos de Uso
- Evaluar impacto de contribuciones de cada miembro del equipo.
- Identificar usuarios clave en gestión de PRs/issues.