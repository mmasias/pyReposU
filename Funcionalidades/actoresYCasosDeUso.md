
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
   - Accede al sistema para ver el estado de las entregas de cada estudiante (si están a tiempo, fuera de tiempo, etc.) y las notas asignadas automáticamente.

3. **Revisar y evaluar el código**
   - Revisa el código de los estudiantes y asigna una calificación manual si es necesario.
   
4. **Gestionar asistencia**
   - Accede a la información de asistencia de los estudiantes (basada en los commits realizados en días de clase) y verifica si han cumplido con los requisitos de asistencia.

5. **Configurar pruebas automáticas y notas en base a resultados**
   - Configura los tests automáticos que se ejecutarán en cada entrega y define cómo se calificarán los resultados.

6. **Visualizar progreso y actividad**
   - Revisa un resumen del progreso de cada estudiante, con métricas como el número de commits, líneas de código y logros desbloqueados.

7. **Recibir informes automatizados**
   - Genera y descarga informes de desempeño y actividad para obtener un resumen completo del progreso del curso.

8. **Configurar notificaciones y recordatorios**
   - Configura recordatorios automáticos para fechas límite de entregas y recibe notificaciones sobre la actividad de los estudiantes.

9. **Integración con GitHub Classroom**
   - Asigna repositorios privados a los estudiantes y accede a cada uno sin comprometer la privacidad de las entregas.

### Casos de Uso para el **Estudiante**
1. **Realizar entregas de tareas**
   - Sube su trabajo al repositorio asignado mediante pull requests o commits en los días especificados.
   
2. **Recibir y revisar feedback**
   - Recibe notificaciones de feedback y resultados automáticos de sus pruebas.

3. **Verificar su asistencia**
   - Puede acceder al sistema para verificar si sus commits han sido registrados como asistencia en los días de clase.

4. **Consultar progreso y resultados**
   - Revisa su progreso en el curso y su calificación acumulada en base a las entregas y asistencias.

5. **Recibir recordatorios de fechas límite**
   - Recibe notificaciones o recordatorios automáticos de fechas importantes, como próximas entregas o retos semanales.

6. **Participar en pruebas automáticas y recibir notas**
   - Puede ver los resultados de las pruebas automáticas ejecutadas en su código y recibir una calificación automática en función de estos resultados.

7. **Acceso privado mediante GitHub Classroom**
   - Asegura que sus entregas sean privadas en un repositorio que solo el profesor puede ver.

![casosDeUso](https://github.com/user-attachments/assets/c3885bd7-c8f7-4741-975a-7b93b0ccaaa9)

