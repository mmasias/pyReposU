# Estado del Arte: Uso de GitHub en Educación de Ingeniería Informática

Resumen de los hallazgos de diversas investigaciones sobre el uso de GitHub en la enseñanza de programación y ciencias de la computación.

---

## 1. Ventajas del Uso de GitHub Según Estudiantes

- **Desarrollo de Habilidades Profesionales**:  
  La experiencia con herramientas como Git y GitHub ayuda a los estudiantes a familiarizarse con flujos de trabajo usados en la industria, como el control de versiones y la colaboración en equipo (Feliciano, 2015). Además, herramientas como SOBO mejoran la calidad del código mediante retroalimentación automatizada (Bobadilla et al., 2023).

- **Retroalimentación Inmediata**:  
  GitHub Classroom permite la retroalimentación en tiempo real mediante pruebas automáticas, facilitando un aprendizaje iterativo (Bennedsen et al., 2022). CodeRunner también destaca por proporcionar feedback rápido en tareas de programación (Srinivasan et al., 2024).

- **Transparencia en el Progreso**:  
  Los estudiantes pueden revisar su progreso y contribuciones a lo largo del tiempo, lo cual fomenta una mayor conciencia y responsabilidad sobre su aprendizaje (Angulo & Aktunc, 2018).

- **Fomento de la Colaboración**:  
  GitHub Classroom y herramientas como GHC permiten la creación de repositorios compartidos, útiles para proyectos grupales y colaborativos, y facilitan el aprendizaje basado en equipos (Srinivasan et al., 2024).

---

## 2. Ventajas del Uso de GitHub Según Profesores

- **Automatización de la Evaluación**:  
  Herramientas como GitHub Actions y CodeRunner permiten la evaluación automática de tareas y proyectos, reduciendo significativamente el tiempo dedicado a revisiones manuales y permitiendo a los profesores enfocarse en la retroalimentación conceptual (Srinivasan et al., 2024).

- **Monitoreo de Actividad de los Estudiantes**:  
  GitHub facilita el seguimiento de la participación individual en proyectos grupales mediante métricas de commits y contribuciones, ayudando a evaluar el esfuerzo y la calidad del trabajo (Tu et al., 2022; Srinivasan et al., 2024).

- **Uso de Herramientas de la Industria**:  
  GitHub Classroom brinda acceso a recursos avanzados como Codespaces, que mejora la experiencia de desarrollo en equipo (Glassey, 2019).

- **Fomento de Buenas Prácticas**:  
  Herramientas como SOBO pueden integrarse para mejorar la calidad del código y enseñar principios fundamentales como el manejo de errores y la limpieza del código (Bobadilla et al., 2023).

---

## 3. Desafíos del Uso de GitHub Según Estudiantes

- **Curva de Aprendizaje**:  
  Muchos estudiantes principiantes enfrentan dificultades al familiarizarse con Git y GitHub, lo cual puede ralentizar su progreso inicial en el curso (Tu et al., 2022; Srinivasan et al., 2024).

- **Sobrecarga de Información**:  
  La retroalimentación automatizada, como la proporcionada por SOBO, puede ser percibida como excesiva, lo que lleva a que algunos estudiantes ignoren los mensajes (Bobadilla et al., 2023).

- **Dificultad en la Interpretación de Pruebas**:  
  Los estudiantes a veces encuentran compleja la interpretación de los resultados de pruebas automatizadas, lo que requiere orientación adicional (Bennedsen et al., 2022).

- **Preocupación por la Privacidad**:  
  Algunos estudiantes se sienten incómodos con el acceso público a sus repositorios, lo cual puede afectar su confianza en el proceso de evaluación (Feliciano, 2015).

---

## 4. Desafíos del Uso de GitHub Según Profesores

- **Configuración Inicial Compleja**:  
  La configuración de GitHub Classroom, CodeRunner y herramientas de CI/CD requiere habilidades técnicas avanzadas y tiempo para ajustarse a cada curso (Angulo & Aktunc, 2018; Srinivasan et al., 2024).

- **Evaluación Limitada de Calidad del Código**:  
  La automatización no siempre captura aspectos de calidad y diseño del código, lo que puede requerir revisiones manuales adicionales (Tu et al., 2022).

- **Gestión de Privacidad**:  
  GitHub plantea desafíos en la protección de la privacidad de los estudiantes, lo cual es crucial para evitar problemas éticos y de plagio. Herramientas como MOSS pueden mitigar estos problemas (Srinivasan et al., 2024).

- **Adopción Inicial**:  
  Profesores y estudiantes suelen necesitar capacitación para utilizar herramientas avanzadas como GHC o CR de manera efectiva (Srinivasan et al., 2024).

---

## 5. Oportunidades para el Proyecto

Basado en los hallazgos anteriores, el proyecto podría incluir funcionalidades como:

- **Automatización y Retroalimentación**:  
  - Integrar pruebas automáticas y retroalimentación instantánea para mejorar el aprendizaje iterativo.  
  - Incorporar herramientas como SOBO para fomentar buenas prácticas de programación desde etapas iniciales.

- **Sistema de Puntuación y Logros**:  
  - Crear un sistema de logros basado en contribuciones, correcciones de código y participación en equipos.

- **Repositorios Privados y Gestión de Equipos**:  
  - Estandarizar repositorios grupales y plantillas para proyectos colaborativos, asegurando la privacidad y el control de acceso.

- **Rastreo de Progreso**:  
  - Automatizar el monitoreo de commits y contribuciones individuales para proporcionar una visión detallada del progreso del estudiante.

- **Capacitación Inicial**:  
  - Diseñar tutoriales específicos para que estudiantes y profesores se familiaricen con las herramientas y flujos de trabajo.

- **Evaluación Holística**:  
  - Incorporar métricas adicionales para evaluar la calidad del diseño y la claridad del código, complementando las pruebas funcionales.

- **Fomento de Proyectos Colaborativos**:  
  - Utilizar GitHub Classroom o repos privados para gestionar proyectos a largo plazo o grupales.

---

## Conclusiones

El análisis del estado actual de herramientas educativas basadas en GitHub y tecnologías relacionadas ofrece varias lecciones clave para desarrollar un framework efectivo:

1. **Escalabilidad y Automatización**:  
   El uso de herramientas como GitHub Actions, CodeRunner y SOBO demuestra que la automatización reduce la carga de trabajo de los profesores y mejora el aprendizaje iterativo de los estudiantes. Es fundamental incorporar tests automatizados que no solo evalúen funcionalidad, sino también calidad de código y diseño.

2. **Fomentar la Colaboración**:  
   Proveer estructuras claras para proyectos colaborativos es esencial. Repositorios compartidos y métricas de contribución pueden incentivar el trabajo en equipo y garantizar evaluaciones más justas.

3. **Flexibilidad y Adaptabilidad**:  
   La configuración inicial debe ser lo suficientemente flexible para adaptarse a cursos de distintos niveles de complejidad. Incluir plantillas estandarizadas y configuraciones predefinidas puede facilitar el uso tanto para principiantes como para usuarios avanzados.

4. **Privacidad y Ética**:  
   Es crucial garantizar la privacidad de los estudiantes mediante repositorios privados y políticas claras de acceso. Esto también puede evitar problemas de plagio y a proteger los derechos de los estudiantes.

5. **Capacitación y Soporte Continuo**:  
   Dado que tanto estudiantes como profesores enfrentan barreras técnicas al inicio, incluir materiales de capacitación, tutoriales interactivos y soporte técnico es clave para una adopción exitosa.

6. **Evaluación Integral**:  
   Más allá de pruebas funcionales, el framework debe incluir evaluaciones de calidad de código, claridad y mantenibilidad.


---

> **Referencias**:  
> - Bennedsen, J., Böjttjer, T., & Tola, D. (2022). Using GitHub Classroom in Teaching Programming.  
> - Feliciano, J. (2015). *Towards a Collaborative Learning Platform: The Use of GitHub in Computer Science and Software Engineering Courses*.  
> - Angulo, M. A., & Aktunc, O. (2018). Using GitHub as a Teaching Tool for Programming Courses.  
> - Glassey, R. (2019). Adopting Git/Github within Teaching: A Survey of Tool Support.  
> - Tu, Y.-C., et al. (2022). *GitHub in the Classroom: Lessons Learnt*.  
> - Srinivasan, B., et al. (2024). *Automated Computer Program Evaluation and Projects – Our Experiences*.  
> - Bobadilla, S., et al. (2023). *SOBO: A Feedback Bot to Nudge Code Quality in Programming Courses*.
