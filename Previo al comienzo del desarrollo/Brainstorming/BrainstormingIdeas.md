# Brainstorming Ideas

### Análisis de commits, líneas de código y pull requests:

**Descripción**: Obtener datos de commits, líneas de código añadidas o eliminadas, y pull requests basados en diferentes parámetros (fecha, hora, alumno, grupo de trabajo…).

**Tecnología de GitHub**:
- GitHub API (para extraer datos sobre commits y pull requests).
- GitHub GraphQL API (para consultas más complejas y optimizadas sobre el historial de repositorios).

### Sistema de corrección automática de tareas con tests:

**Descripción**: Implementar un sistema que permita añadir tests a las tareas, de manera que GitHub ejecute automáticamente los tests y asigne una puntuación basada en los resultados.

**Tecnología de GitHub**:
- GitHub Actions (para ejecutar automáticamente los tests al recibir un pull request).
- GitHub Checks API (para validar el estado de los tests y reportar los resultados).

### Asignación automática de puntuaciones en trabajos en equipo:

**Descripción**: Sistema que evalúe la contribución de cada miembro en proyectos grupales, basado en la frecuencia de commits, pull requests, y otros parámetros, y asigne puntuaciones automáticamente. Estas puntuaciones podrían reflejarse en gráficos o logros.

**Tecnología de GitHub**:
- GitHub API (para obtener información de commits y pull requests por usuario).
- GitHub Webhooks (para disparar eventos en tiempo real sobre la actividad de los usuarios en el repositorio).

### Sistema de visualización del progreso y asistencia para alumnos:

**Descripción**: Un sistema donde los alumnos puedan ver su asistencia a las clases y el progreso de sus tareas a través de un Excel compartido o una posible interfaz.

**Tecnología de GitHub**:
- GitHub Pages (para alojar una web donde los alumnos puedan visualizar su progreso).
- GitHub API (para extraer datos sobre asistencia, commits, y pull requests de los estudiantes).

### Calendario integrado con fechas de entrega:

**Descripción**: Implementar un calendario donde los alumnos puedan ver las fechas de entrega de manera más accesible sin tener que entrar a GitHub. También se les podrían añadir recordatorios.

**Tecnología de GitHub**:
- GitHub API (para obtener las fechas límite de los issues o milestones en los repositorios donde se notifique la fecha).
- GitHub Actions (para enviar notificaciones o recordatorios a los alumnos sobre las fechas próximas).

### Sistema de logros y recompensa:

**Descripción**: Un sistema de premios donde los alumnos puedan desbloquear logros en función de su actividad (número de commits, entregas puntuales, etc.), incentivando la participación. Estos logros podrían ser del tipo sumar x a la nota de cierta práctica o proyecto o por constancia sacar mínimo cierta nota en la tarea. Por la parte del profesor estos se podrían usar para evaluar.

**Tecnología de GitHub**:
- GitHub Webhooks (para desencadenar eventos y notificar sobre logros desbloqueados).
- GitHub API (para rastrear el historial de commits y pull requests de cada alumno).

### Notificaciones automáticas de feedback:

**Descripción**: Un sistema que envíe notificaciones automáticas a los alumnos cuando el profesor revise su trabajo o cuando se cumplan ciertas condiciones, como la entrega exitosa o el fallo en un test.

**Tecnología de GitHub**:
- GitHub Actions (para enviar notificaciones automáticas).
- GitHub Webhooks (para desencadenar notificaciones basadas en eventos en tiempo real).

### Análisis de actividad de los alumnos por proyecto:

**Descripción**: Realizar un análisis detallado de la actividad de los alumnos por proyecto, visualizando su evolución en el tiempo mediante gráficos que muestren su contribución (commits, pull requests, issues resueltos).

**Tecnología de GitHub**:
- GitHub Insights (para obtener información detallada sobre la actividad de los repositorios).
- GitHub API (para extraer los datos y generar visualizaciones personalizadas).

### Control de versiones para el contenido de las tareas:

**Descripción**: Implementar un sistema que controle las versiones de los archivos entregados y permita hacer un seguimiento detallado de los cambios realizados en cada entrega.

**Tecnología de GitHub**:
- GitHub API (para rastrear las versiones de los archivos entregados y obtener comparativas entre versiones).

### Panel interactivo para profesores:

**Descripción**: Un panel donde los profesores puedan gestionar sus asignaturas, visualizar el progreso de los alumnos, y configurar parámetros de evaluación como los criterios de puntuación automática y fechas de entrega.

**Tecnología de GitHub**:
- GitHub Pages (para alojar el panel interactivo).
- GitHub API (para manejar la configuración y extracción de datos).

### Corrector de estilo de código (Checkstyle):

**Descripción**: Implementar un sistema que ejecute un análisis de estilo de código (Checkstyle) automáticamente en los pull requests. Esto ayudará a los alumnos a mejorar la calidad y limpieza de su código, guiándolos en la aplicación de buenas prácticas de programación.

**Tecnología de GitHub**:
- GitHub Actions (para ejecutar Checkstyle u otras herramientas de linters y reportar los resultados).
- GitHub Checks API (para integrar los resultados en el sistema de revisiones).

### Uso de GitHub Copilot para sugerencias automáticas:

**Descripción**: Integrar GitHub Copilot para que los estudiantes reciban sugerencias de código automatizadas mientras trabajan en sus tareas. El profesor podría configurar los parámetros de Copilot para que ofrezca sugerencias en áreas específicas.

**Tecnología de GitHub**:
- GitHub Copilot (como herramienta de ayuda durante el desarrollo).
- GitHub Codespaces (para proporcionar un entorno de desarrollo completamente configurado con Copilot y las configuraciones del curso).

### Evaluación del progreso en tiempo real con Copilot Insights:

**Descripción**: Implementar un sistema donde Copilot analice el progreso de los estudiantes en tiempo real, sugiriendo mejoras o enfoques alternativos. Esto podría incluir la generación de estadísticas sobre el nivel de complejidad del código escrito y la frecuencia de uso de las recomendaciones de Copilot.

**Tecnología de GitHub**:
- GitHub Copilot Insights (para analizar cómo los estudiantes usan las recomendaciones de Copilot).
- GitHub Actions (para generar reportes automáticos de la actividad de Copilot).

### Sistema de revisión por pares automatizado:

**Descripción**: Implementar un sistema en el que las tareas se asignen automáticamente a otros estudiantes para revisión por pares, basándose en parámetros predefinidos como nivel de experiencia o cantidad de tareas corregidas previamente. Los estudiantes podrían dar feedback sobre el código de sus compañeros.

**Tecnología de GitHub**:
- GitHub Pull Request Review (para gestionar revisiones automáticas).
- GitHub Actions (para automatizar la asignación de revisiones entre los estudiantes).

### Sistema de seguimiento de productividad personal:

**Descripción**: Implementar una funcionalidad que permita a los alumnos hacer un seguimiento de su productividad individual en GitHub. Por ejemplo, se podría mostrar cuánto tiempo dedican al desarrollo, cuántos commits realizan en promedio por semana, o qué tipo de errores cometen más frecuentemente.

**Tecnología de GitHub**:
- GitHub API (para rastrear las estadísticas de productividad).
- GitHub Insights (para generar reportes personalizados).

### Asistente virtual basado en GitHub Copilot:

**Descripción**: Crear un asistente virtual impulsado por GitHub Copilot que responda a las preguntas de los estudiantes sobre el código o las tareas. El asistente podría ofrecer sugerencias automáticas o guiar al estudiante hacia la solución de problemas comunes.

**Tecnología de GitHub**:
- GitHub Copilot (para generar respuestas automáticas y sugerencias).
- GitHub API (para gestionar la interacción con los alumnos).

### Sistemas de premios y recompensas dinámicas:

**Descripción**: Implementar un sistema dinámico de recompensas que se ajuste en tiempo real a la actividad de los estudiantes, otorgando premios por logros como "Mayor cantidad de commits en una semana" o "Mayor número de líneas de código editadas”. Estas recompensas podrían ser por ejemplo mayor nota.

**Tecnología de GitHub**:
- GitHub Webhooks (para activar la creación de badges automáticamente).
- GitHub API (para rastrear las actividades de los alumnos).

### Modo de tutoría inversa:

**Descripción**: Implementar una función donde los alumnos puedan analizar el código de otros grupos o incluso del profesor para aprender mejores prácticas. Esto sería como una "tutoría inversa" donde los estudiantes aprenden revisando código avanzado.

**Tecnología de GitHub**:
- GitHub Pull Request Review (para que los alumnos revisen y comenten en el código).
- GitHub Insights (para ver cómo los comentarios mejoran el rendimiento).

### Integración con herramientas de refactorización automática:

**Descripción**: Incluir una herramienta que sugiera y realice automáticamente refactorizaciones en el código entregado por los alumnos para mejorar su estructura o eficiencia, explicando los cambios realizados.

**Tecnología de GitHub**:
- GitHub Actions (para ejecutar la refactorización automáticamente).
- GitHub Copilot (para sugerir mejoras y refactorizaciones).

### Sistema de retos semanales:

**Descripción**: Crear retos de programación semanales con diferentes niveles de dificultad (básico, intermedio, avanzado). Los alumnos podrán participar y subir sus soluciones a GitHub, y el sistema evaluará automáticamente las mejores soluciones basadas en criterios como tiempo de ejecución, eficiencia y estilo de código.

**Tecnología de GitHub**:
- GitHub Actions (para ejecutar y evaluar los retos automáticamente).
- GitHub Issues/Milestones (para gestionar los retos y su progreso).

### Sistema de código en vivo (Live Coding):

**Descripción**: Implementar una función donde los estudiantes puedan codificar en vivo dentro de GitHub, y tanto el profesor como otros alumnos puedan unirse a la sesión para colaborar o dar feedback en tiempo real.

**Tecnología de GitHub**:
- GitHub Codespaces (para facilitar un entorno de desarrollo colaborativo en tiempo real).
- GitHub Discussions (para chat o interacciones mientras se codifica).

### Generador de informes automáticos para profesores:

**Descripción**: Un sistema que automáticamente genere informes detallados sobre el progreso de cada alumno (número de commits, tareas completadas, calidad de los tests, asistencia) y lo entregue en un formato legible para el profesor.

**Tecnología de GitHub**:
- GitHub API (para extraer datos y generar informes).
- GitHub Actions (para automatizar la generación y entrega de informes).

### Generador de informes personalizados para alumnos:

**Descripción**: Los estudiantes podrían generar informes de su propio progreso con un solo clic, obteniendo un resumen detallado de su desempeño en las tareas, incluyendo estadísticas como el porcentaje de tests aprobados, cantidad de commits, tiempo promedio entre commits, posibles evaluaciones automáticas…

**Tecnología de GitHub**:
- GitHub API (para obtener estadísticas personalizadas).
- GitHub Actions (para automatizar la creación de informes).

### Sistema de detección de plagio o similitud de código:

**Descripción**: Implementar un sistema que detecte automáticamente código plagiado o demasiado similar entre los repositorios de estudiantes. Al identificar similitudes, se podrían generar alertas automáticas para que el profesor revise el caso.

**Tecnología de GitHub**:
- GitHub API (para comparar el código entre repositorios).
- GitHub Actions (para ejecutar las comparaciones automáticamente).

### Sistema de seguimiento del aprendizaje:

**Descripción**: Crear un sistema que mida el progreso de cada estudiante no solo en términos de entrega de tareas, sino también en su evolución como desarrollador, destacando áreas en las que ha mejorado, como eficiencia, estilo de código o manejo de errores.

**Tecnología de GitHub**:
- GitHub API (para analizar la evolución del código a lo largo del tiempo).
- GitHub Copilot (para proporcionar sugerencias de mejora basadas en patrones de aprendizaje).

### Integración de feedback continuo:

**Descripción**: Un sistema que ofrezca feedback inmediato cuando el estudiante haga un commit, con recomendaciones automáticas sobre estilo, estructura de código y eficiencia, permitiendo que los estudiantes mejoren su código progresivamente.

**Tecnología de GitHub**:
- GitHub Copilot (para generar sugerencias y recomendaciones).
- GitHub Checks API (para realizar revisiones automáticas en cada commit).

### Contribución a proyectos en equipo:

**Descripción**: Permitir que los estudiantes trabajen en equipo utilizando un repositorio compartido en GitHub, simulando la colaboración en proyectos reales. El sistema evaluará las contribuciones de cada miembro (commits, pull requests, etc.) y facilitará el seguimiento de las tareas grupales, proporcionando informes detallados del rendimiento de cada participante.

**Tecnología de GitHub**:
- GitHub Forking & Pull Requests (para gestionar las contribuciones de los estudiantes).
- GitHub Actions (para automatizar la evaluación de las contribuciones y revisar los pull requests).
- GitHub Projects (para gestionar el flujo de trabajo dentro del equipo, como tableros kanban).

### Integración con GitHub Classroom para privacidad en las tareas:

**Descripción**: Utilizar GitHub Classroom para que cada estudiante tenga un repositorio privado y seguro, manteniendo las entregas separadas de las de sus compañeros. Esto permitiría al profesor acceder a los trabajos individualmente sin que los otros estudiantes puedan ver lo que ha hecho cada uno.

**Tecnología de GitHub**:
- GitHub Classroom (para crear repositorios privados por estudiante).
- GitHub Actions (para automatizar la corrección de las tareas y proporcionar feedback en privado).

### Sistema de peer-review pero anónimo en GitHub Classroom:

**Descripción**: Implementar un sistema de revisión por pares donde los estudiantes puedan evaluar el trabajo de otros compañeros de forma anónima. GitHub Classroom aseguraría que las revisiones se distribuyan de forma equitativa y que los estudiantes no puedan saber quién está revisando su trabajo.

**Tecnología de GitHub**:
- GitHub Classroom (para gestionar la privacidad de las revisiones).
- GitHub Pull Request Reviews (para permitir a los estudiantes hacer revisiones).
- GitHub Actions (para asignar automáticamente las tareas de revisión).

### Sistemas de competencia entre grupos:

**Descripción**: Implementar una función que permita que varios grupos de estudiantes compitan entre ellos en la resolución de una tarea o proyecto. Los grupos recibirán puntos según la calidad del código, el tiempo de entrega, o la eficiencia de los tests automáticos, fomentando la colaboración y la competencia sana.

**Tecnología de GitHub**:
- GitHub Projects (para gestionar los proyectos de cada equipo).
- GitHub Actions (para realizar pruebas automáticas y evaluar los resultados).
- GitHub API (para generar rankings entre los grupos).
