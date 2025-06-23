## GitSEED: Herramienta de Evaluación Automatizada para la Educación en Ingeniería de Software

### Resumen
El artículo de Orvalho et al. (2024) presenta GitSEED, una herramienta de evaluación automatizada respaldada por GitLab, diseñada para la educación en Ingeniería de Software y Programación. GitSEED permite a los estudiantes recibir retroalimentación personalizada sobre sus proyectos mediante GitLab, aprovechando las capacidades de integración continua (CI) para realizar evaluaciones automatizadas de código. Los estudiantes interactúan directamente a través de GitLab, donde GitSEED evalúa sus envíos de código mediante herramientas de análisis y publica los resultados en sus repositorios. GitSEED es agnóstico al lenguaje de programación y permite una personalización flexible de su pipeline de evaluación.

### Objetivo
GitSEED busca mejorar la enseñanza en cursos de ingeniería de software y programación proporcionando una plataforma que integra las prácticas de control de versiones y evaluación automatizada, orientada a estudiantes de Ciencias de la Computación e Ingeniería de Software.

### Metodología
GitSEED emplea GitLab como interfaz principal, donde los estudiantes pueden realizar envíos de código, mientras que GitSEED evalúa automáticamente estos envíos mediante pruebas preconfiguradas por los docentes. El flujo de trabajo general de GitSEED incluye:
1. **Interacción Estudiante-GitLab**: Los estudiantes usan GitLab para realizar sus envíos de código.
2. **Evaluación Automatizada**: GitSEED, activado por cada envío, ejecuta pruebas definidas por el docente y herramientas de análisis de código.
3. **Publicación de Resultados**: GitSEED almacena la retroalimentación en un repositorio específico, facilitando su revisión.

### Ventajas del Uso de GitSEED
- **Agnóstico al Lenguaje**: GitSEED admite cualquier lenguaje de programación, permitiendo a los docentes adaptar la herramienta a diferentes cursos.
- **Feedback Inmediato**: La integración con CI permite a los estudiantes recibir retroalimentación inmediata sobre errores y áreas de mejora.
- **Desarrollo de Habilidades Profesionales**: Los estudiantes se familiarizan con Git y GitLab, preparando así su transición al mundo laboral.

### Desafíos Observados
- **Curva de Aprendizaje de Git**: Los estudiantes nuevos enfrentaron problemas en el uso de GitLab, especialmente al olvidar sincronizar sus repositorios locales con los cambios en GitLab.
- **Sobrecarga del Sistema**: Para evitar saturar el sistema, GitSEED impone un tiempo de espera (cool-down) entre los envíos.

### Conclusión
GitSEED se presenta como una herramienta educativa efectiva para cursos de programación, mejorando la participación estudiantil y facilitando el proceso de aprendizaje. La plataforma ofrece una solución adaptable y profesional al evaluar tareas y proyectos de los estudiantes.

> **Referencia**: Orvalho, P., Janota, M., & Manquinho, V. (2024). *GitSEED: A Git-backed Automated Assessment Tool for Software Engineering and Programming Education*.
