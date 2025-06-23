## GitHub en el Aula: Lecciones Aprendidas

### Resumen
El artículo de Tu et al. (2022) presenta un análisis exhaustivo sobre la implementación de Git y GitHub en cursos universitarios, especialmente a través de GitHub Classroom (GHC). Los autores, con experiencia en varios cursos de ciencias de la computación y desarrollo de software, destacan los beneficios de GitHub en el contexto educativo, además de los desafíos y las estrategias adoptadas para superarlos. 

### Beneficios de GitHub en la Educación
1. **Colaboración y Desarrollo de Habilidades Profesionales**: GitHub no solo permite a los estudiantes practicar con herramientas comunes en la industria, sino que fomenta la colaboración en equipos, facilitando la experiencia en control de versiones y desarrollo colaborativo.
2. **Automatización en Evaluaciones**: GitHub Classroom permite la evaluación automática de tareas, integrando pruebas y acciones de CI (integración continua) para verificar el código de los estudiantes.
3. **Accesibilidad y Apoyo a la Docencia**: Herramientas como el _pull request_ y los comentarios línea a línea facilitan la retroalimentación individualizada y eficiente, especialmente útil en cursos grandes o en modalidad online.

### Desafíos y Estrategias de Mitigación
1. **Curva de Aprendizaje para Novatos**: Los estudiantes principiantes suelen tener dificultades para aprender Git, por lo que se recomienda proporcionar un archivo `.gitignore` desde el inicio y una instrucción básica para evitar errores comunes.
2. **Gestión de Flujos de Trabajo en Equipo**: La mayoría de estudiantes principiantes tienen problemas con conflictos de fusión y configuración de ramas. El uso del flujo de trabajo de ramas de características (_feature branching_) resultó ser más adecuado para los principiantes.
3. **Limitaciones en GitHub Actions**: Las acciones en GitHub tienen un límite de tiempo en su versión gratuita, lo cual puede agotarse rápidamente si los estudiantes usan CI como principal medio de prueba. Como solución, los instructores establecieron que las acciones se ejecuten solo en ramas de entrega específicas para optimizar el uso del tiempo asignado.

### Lecciones Aprendidas
1. **Sincronización con LMS**: GHC ofrece la posibilidad de sincronizar listas de estudiantes con sistemas LMS como Canvas o Moodle. Sin embargo, el enlace manual que los estudiantes deben hacer para asociar su cuenta a la lista es un proceso que puede causar problemas, por lo que el equipo recomienda gestionar los CSV manualmente.
2. **Repositorios de Equipos y Asignaciones Grupales**: Las asignaciones grupales en GHC presentan retos, ya que los estudiantes pueden unirse a cualquier equipo sin restricciones. Es importante establecer convenciones de nomenclatura claras y límites de miembros en los equipos para simplificar la gestión.
3. **Evaluación Automática y _Feedback_**: GHC permite evaluar a través de _pull requests_ y la ejecución de pruebas automáticas, pero su uso intensivo puede ser poco práctico en clases grandes debido al esfuerzo de revisión detallada. Sin embargo, es útil para proyectos más avanzados donde se espera una mayor autonomía de los estudiantes.
4. **Protección de Ramas y Control de Acceso**: Para equipos de estudiantes avanzados, se recomienda el uso de reglas de protección de ramas para evitar la pérdida de trabajo o la sobrescritura accidental. Además, en cursos de niveles superiores, se permite que los estudiantes tengan derechos administrativos para fomentar la toma de decisiones independientes.

### Conclusiones
Los autores concluyen que, aunque GitHub introduce una carga adicional en la enseñanza, su implementación en el aula ofrece un valor significativo en términos de aprendizaje práctico y gestión de tareas colaborativas. Para maximizar su efectividad, es importante ajustar las configuraciones y prácticas según el nivel de experiencia de los estudiantes y las características específicas del curso.

> **Referencia**: Tu, Y.-C., Terragni, V., Tempero, E., Shakil, A., Meads, A., Giacaman, N., Fowler, A., & Blincoe, K. (2022). *GitHub in the Classroom: Lessons Learnt*. En *Australasian Computing Education Conference (ACE '22)*, Virtual Event, Australia. DOI: 10.1145/3511861.3511879.
