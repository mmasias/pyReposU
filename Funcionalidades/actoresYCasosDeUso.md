
# Actores y Casos de Uso

Este documento describe los actores principales y los casos de uso para el sistema de gestión de entregas de proyectos y asistencia basado en **GitHub** y **Google Sheets**.

## Actores

### 1. Profesor
   - **Rol**: Supervisa, gestiona y evalúa las entregas y el progreso de los estudiantes.
   - **Acciones principales**:
     - Crear cursos y configurar entregas.
     - Visualizar el progreso y la actividad de cada estudiante.
     - Revisar y calificar entregas.
     - Recibir notificaciones sobre la actividad de los estudiantes.
     - Configurar parámetros de evaluación (asistencia, calidad de código, etc.).
     - Descargar informes automáticos.

### 2. Estudiante
   - **Rol**: Participa en las actividades del curso mediante la entrega de proyectos y pruebas de su asistencia.
   - **Acciones principales**:
     - Hacer entregas de trabajos en GitHub (mediante commits o pull requests).
     - Verificar su estado de asistencia.
     - Recibir notificaciones de feedback.
     - Acceder a informes y estadísticas de su progreso.
     - Colaborar en proyectos grupales (si aplica).
     - Recibir recordatorios de fechas límite.

---

## Casos de Uso

### Casos de Uso para el **Profesor**
1. **Configurar un curso**
   - Configura el curso y los parámetros iniciales, como el calendario de clases, los criterios de evaluación y los repositorios para las entregas.

2. **Verificar y supervisar las entregas**
   - Accede al sistema para ver el estado de las entregas de cada estudiante (si están a tiempo, fuera de tiempo, o no entregadas) y las notas asignadas automáticamente.  
   - Recibe notificaciones sobre el estado de los PRs enviados por los estudiantes.

3. **Revisar y evaluar el código**
   - Revisa el código de los estudiantes a través de los PRs y verifica los resultados de las pruebas automáticas.  
   - Asigna calificaciones manuales si es necesario.

4. **Gestionar asistencia**
   - Revisa la asistencia de los estudiantes basada en sus commits en días de clase y valida automáticamente su participación.

5. **Configurar pruebas automáticas y notas en base a resultados**
   - Configura los tests automáticos que se ejecutarán en cada entrega y define cómo se calificarán los resultados en Google Sheets.

6. **Visualizar progreso y actividad**
   - Revisa un resumen del progreso de cada estudiante, con métricas como número de commits, PRs creados, líneas de código y contribuciones.
7. **Recibir informes automatizados**
   - Genera y descarga informes de desempeño y actividad para obtener un resumen completo del progreso del curso.

8. **Configurar notificaciones y recordatorios**
   - Configura recordatorios automáticos para fechas límite de entregas y recibe notificaciones sobre la actividad de los estudiantes

9. **Acceder al panel interactivo**
   - Consulta un panel centralizado que muestra el estado general de todos los estudiantes, con opciones para filtrar por desempeño, asistencia o actividad.

10. **Integración con GitHub Classroom**
   - Asigna repositorios privados a los estudiantes para mantener la privacidad de las entregas y accede directamente a cada uno sin comprometer esta privacidad.

11. **Evaluar colaboración grupal**
   - Supervisa y evalúa la colaboración en trabajos grupales mediante métricas como frecuencia de commits, tamaño de cambios y contribuciones individuales.

---

### Casos de Uso para el **Estudiante**
1. **Realizar entregas de tareas**
   - Sube su trabajo al repositorio asignado mediante pull requests y verifica el estado de sus entregas (a tiempo, fuera de tiempo, o no entregadas).

2. **Recibir y revisar feedback**
   - Recibe notificaciones automáticas sobre el estado de sus entregas, resultados de pruebas automáticas y cualquier feedback adicional proporcionado por el profesor.

3. **Verificar su asistencia**
   - Puede acceder al sistema para verificar si sus commits han sido registrados como válidos en los días de clase asignados.

4. **Consultar progreso y resultados**
   - Revisa su progreso en el curso y las calificaciones obtenidas en base a sus entregas, asistencia y resultados de pruebas automáticas.

5. **Recibir recordatorios de fechas límite**
   - Recibe notificaciones o recordatorios automáticos sobre fechas importantes, como próximas entregas o evaluaciones.

6. **Participar en pruebas automáticas y recibir notas**
   - Visualiza los resultados de las pruebas automáticas ejecutadas en su código y revisa su calificación asignada en base a estos resultados.

7. **Acceso privado mediante GitHub Classroom**
   - Realiza entregas en un repositorio privado al que solo el profesor tiene acceso, asegurando la privacidad de su trabajo.

8. **Consultar análisis de su actividad**
   - Accede a un resumen detallado de su actividad, incluyendo el número de commits, PRs creados y líneas de código entregadas.

9. **Colaborar en proyectos grupales**
   - Participa en trabajos grupales asignados en repositorios compartidos y verifica su contribución individual a través del sistema.

10. **Visualizar progreso en el panel interactivo**
   - Revisa su desempeño a lo largo del curso mediante gráficos y tablas accesibles desde el sistema, comparando su progreso con el promedio del grupo.



![ActoresYCDU](https://github.com/user-attachments/assets/5d4b5b61-9f5f-42c7-9f31-01dfd30bc7a0)


