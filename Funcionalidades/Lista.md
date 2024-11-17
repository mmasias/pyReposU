# Funcionalidades del Proyecto

Este documento detalla las principales funcionalidades a desarrollar para el sistema de gestión de entregas basado en **GitHub** y **Google Sheets**. Estas funcionalidades tienen como objetivo mejorar la organización y evaluación de los proyectos de los estudiantes, proporcionando un seguimiento automatizado y herramientas de análisis para profesores y alumnos.

## Lista de Funcionalidades

### 1. Control de Entregas mediante Pull Requests
   - **Descripción**: Verificar si un PR fue enviado a una rama específica del repositorio antes de una fecha y hora límite.
   - **Detalles**:
     - Validar la entrega en función de la fecha/hora límite y la rama del repositorio.
     - Reflejar el estado de la entrega en Google Sheets (entregado a tiempo, fuera de tiempo, o sin entrega).
     - Notificar al estudiante del estado del pr.

### 2. Validación Automática de Código
   - **Checkstyle y linters**: Implementar un corrector de estilo (Checkstyle, ESLint, etc.) para verificar automáticamente la calidad del código y reflejar el resultado en Google Sheets.
   - **Pruebas Automáticas**: Configurar pruebas automáticas en GitHub Actions que se ejecuten cuando un PR es creado, evaluando el código automáticamente.
   - **Asignación de Notas**: Calificar la entrega en función de los resultados de las pruebas automáticas y de si la tarea fue entregada en plazo o no, reflejando los resultados en una nota en Google Sheets.

### 3. Sistema de Asistencia basado en Commits
   - **Descripción**: Registrar si los estudiantes han hecho al menos un commit en ciertos días de clase para verificar su participación.
   - **Detalles**:
     - Guardar la información en Google Sheets para tener un registro continuo de asistencia.
     - Requerir al menos un commit para marcar la asistencia como válida en cada sesión.

### 4. Evaluación de Colaboración en Trabajos Grupales
   - **Descripción**: Evaluar la participación de cada miembro en proyectos grupales usando métricas como frecuencia de commits, tamaño de cambios, y frecuencia de contribuciones.
   - **Detalles**:
     - Asignar puntuaciones basadas en la colaboración, calidad y cantidad de aportes.
     - Reflejar los resultados en gráficos o tablas en Google Sheets, proporcionando una vista detallada del desempeño grupal.

### 5. Análisis de Actividad y Progreso
   - **Descripción**: Generar informes automáticos sobre la actividad de cada estudiante, incluyendo el número de PRs, commits, líneas de código, frecuencia, etc.
   - **Detalles**:
     - Implementar visualizaciones de progreso en Google Sheets para ver el desempeño de los estudiantes.
     - Incluir gráficos que muestren la evolución de los estudiantes a lo largo del curso.

### 6. Sistema de Recordatorios y Notificaciones
   - **Descripción**: Enviar recordatorios automáticos y notificaciones para fechas de entrega y feedback.
   - **Detalles**:
     - Recordatorios de fechas límite a través de notificaciones o correos electrónicos.
     - Notificaciones automáticas para informar a los estudiantes cuando sus PRs son revisados o necesitan corregir algo.

### 7. Panel de Control Interactivo para Profesores
   - **Descripción**: Un panel centralizado que permite a los profesores ver rápidamente el estado de todos los estudiantes.
   - **Detalles**:
     - Ver el estado de cada estudiante, incluyendo asistencia, entregas, resultados de pruebas automáticas y puntuaciones.
     - Configuración de criterios de evaluación, permitiendo al profesor ajustar el número mínimo de commits o los estándares de calidad del código.

### 8. Generación de Informes Automatizados DUDOSA
   - **Descripción**: Generar automáticamente informes de desempeño para cada estudiante.
   - **Detalles**:
     - Crear informes personalizados que detallen el progreso de cada estudiante o grupo.
     - Exportar un resumen final con el rendimiento de cada estudiante, que el profesor puede descargar o compartir.

### 9. Ejecución de Tests Automáticos y Notas Basadas en Resultados
   - **Descripción**: Ejecutar pruebas automáticas en cada entrega y asignar una nota en base a los resultados.
   - **Detalles**:
     - Usar GitHub Actions para ejecutar los tests automáticamente en cada PR.
     - Calificar la entrega según el porcentaje de tests pasados y reflejar la calificación en Google Sheets.
     - Tener en cuenta la validación inicial realizada (funcionalidad 2)

### 10. Integración con GitHub Classroom para Privacidad en Entregas
   - **Descripción**: Integrar GitHub Classroom para facilitar la creación de repositorios privados y mantener la privacidad de las entregas de cada estudiante.
   - **Detalles**:
     - Configurar repositorios privados para cada estudiante, donde solo el profesor tiene acceso.
     - Mantener las entregas separadas para garantizar que los estudiantes no puedan ver el trabajo de otros.
     - Automatizar la corrección de tareas y proporcionar feedback en privado utilizando GitHub Actions.
    
## Posibles funcionalidades a añadir en el futuro:

## 1. **Gamificación y Logros**
   - **Descripción**: Introducir un sistema de logros que motive a los estudiantes a participar activamente y mejorar sus habilidades.
   - **Ejemplos de Logros**:
     - "Primera entrega a tiempo".
     - "Mejor estilo de código en la clase".
     - "Mayor número de contribuciones en un proyecto grupal".

## 2. **Protección contra Plagio**
   - **Descripción**: Incorporar herramientas como MOSS (Measure of Software Similarity) para identificar entregas similares entre estudiantes.
   - **Detalles**:
     - Comparar entregas automáticamente para detectar similitudes sospechosas.
     - Informar al profesor si se detecta posible plagio.

---


## 3. **Alertas de Actividad Baja**
   - **Descripción**: Implementar un sistema de alertas para notificar al profesor si un estudiante tiene una actividad baja o irregular.
   - **Detalles**:
     - Configurable para definir el umbral de actividad mínima (por ejemplo, menos de X commits por semana).
     - Enviar un aviso al estudiante y al profesor para tomar medidas.
---


## 4. **Exportación de Resultados a Otras Herramientas**
   - **Descripción**: Permitir la exportación de datos de desempeño a sistemas de gestión académica o herramientas externas.
   - **Detalles**:
     - Exportar en formatos como CSV, PDF o integraciones directas con Moodle.
   - **Beneficio**: Simplifica el trabajo del profesor al consolidar información en una única plataforma.

---
## 5. **Análisis de Desempeño del Grupo**
   - **Descripción**: Generar visualizaciones del rendimiento general del grupo para identificar tendencias y áreas de mejora.
   - **Detalles**:
     - Mostrar gráficos comparativos entre estudiantes o grupos.
     - Resaltar patrones como temas en los que los estudiantes tienen más dificultades.
--





