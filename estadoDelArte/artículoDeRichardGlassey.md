## Adopción de Git/GitHub en la Enseñanza: Un Estudio sobre el Soporte de Herramientas

El artículo de Glassey (2019) explora el creciente uso de Git y GitHub en la educación en ciencias de la computación, principalmente en la gestión de tareas y proyectos de equipo. Glassey analiza el desarrollo de herramientas que facilitan la integración de Git/GitHub en el aula y ofrece una comparación estructurada de diversas soluciones de código abierto diseñadas para apoyar a los docentes.

### Motivaciones para el Uso de Git/GitHub en la Educación
1. **Experiencia Auténtica en Herramientas de la Industria**: Git y GitHub son ampliamente utilizados en la industria del software, y su uso en el aula ofrece a los estudiantes una experiencia cercana a los flujos de trabajo profesionales.
2. **Gestión de Tareas y Retroalimentación**: GitHub permite gestionar y automatizar la distribución de tareas, la evaluación y la retroalimentación en proyectos individuales y de equipo, aumentando la eficiencia tanto para estudiantes como para docentes.
3. **Barreras Técnicas**: A pesar de sus beneficios, Git/GitHub no fueron creados con fines educativos, lo cual representa desafíos de privacidad, control de acceso y una curva de aprendizaje que afecta tanto a estudiantes como a docentes.

### Encuesta de Soluciones de Código Abierto para Docentes
Glassey presenta un análisis de ocho herramientas de código abierto, comparando sus aspectos técnicos y pedagógicos, tales como la organización de equipos, la distribución de tareas y la administración de evaluaciones y retroalimentación:
1. **Agrupación y Distribución**: La mayoría de herramientas permiten trabajar en solitario o en equipo, utilizando un repositorio por estudiante o asignación. Solo una herramienta usa el modelo de una rama por problema, permitiendo un solo repositorio por estudiante, pero con ramas múltiples para cada asignación.
2. **Evaluación y Retroalimentación**: Herramientas como Repomate y Rhomboid permiten evaluar tareas mediante clonación masiva y plugins que ejecutan pruebas automáticas. GitHub Classroom y otras herramientas integran servicios de CI (integración continua) para ofrecer retroalimentación automática a los estudiantes.
3. **Soporte para Equipos y Evaluación por Pares**: Herramientas como Virtual Classroom y Repomate apoyan la evaluación por pares, permitiendo que estudiantes revisen el trabajo de otros en un entorno seguro. Además, GitHub Inc. ha desarrollado herramientas oficiales (GitHub Classroom) que simplifican la creación de repositorios y la distribución de tareas.

### Conclusión
Glassey concluye que la adopción de Git/GitHub en la educación presenta ventajas significativas para la formación práctica de estudiantes en ciencias de la computación, pero también que es necesario un desarrollo constante de herramientas para reducir las barreras técnicas y mejorar la integración con otros sistemas educativos. Este estudio proporciona una referencia para que los docentes encuentren soluciones que se adapten a sus necesidades específicas y, al mismo tiempo, impulsa el desarrollo de nuevas funcionalidades en el ámbito educativo.

## Detalle de las herramientas de Código Abierto para la Integración de Git/GitHub en Educación de las que habla:

En su análisis, Glassey (2019) examina varias herramientas de código abierto que ayudan a los docentes a integrar Git/GitHub en la enseñanza. Las herramientas se comparan en cuanto a su funcionalidad técnica, facilidad de uso, y características pedagógicas como la distribución de tareas, evaluación, y retroalimentación.

### 1. GitHub Classroom
- **Organización**: GitHub Inc.
- **Interfaz**: Basada en la web
- **Características Destacadas**: GitHub Classroom simplifica la creación y distribución de repositorios a estudiantes, creando un entorno virtual de clases donde los docentes pueden monitorear las tareas de los estudiantes. Permite la evaluación continua al integrarse con Travis CI, un servicio de integración continua (CI), que ejecuta pruebas automáticas y ofrece retroalimentación en tiempo real.
  
### 2. Repomate
- **Organización**: KTH Royal Institute of Technology, Suecia
- **Interfaz**: Línea de comandos con arquitectura de plugins
- **Características Destacadas**: Repomate destaca por su capacidad de personalización a través de plugins. Los docentes pueden usar plugins para ejecutar compilaciones, pruebas unitarias y análisis estático de código. Repomate también permite la clonación masiva de repositorios y soporta la evaluación por pares, permitiendo a los estudiantes revisar el trabajo de sus compañeros en un ambiente controlado.

### 3. Teacher’s Pet
- **Organización**: GitHub Inc.
- **Interfaz**: Línea de comandos
- **Características Destacadas**: Aunque el desarrollo activo de Teacher’s Pet finalizó en 2016, sigue siendo una herramienta útil para configurar repositorios y equipos en GitHub de forma automatizada. Fue precursor de GitHub Classroom y se usa principalmente para tareas de configuración y organización inicial.

### 4. Submit50
- **Organización**: Universidad de Harvard
- **Interfaz**: Línea de comandos simplificada
- **Características Destacadas**: Submit50 se centra en hacer el uso de Git más accesible para los estudiantes, creando un comando único `submit` que simplifica el proceso de agregar, confirmar y enviar cambios. Se complementa con Check50, una herramienta para evaluación automática que permite a estudiantes y docentes ejecutar pruebas sobre el código.

### 5. Virtual Classroom
- **Organización**: Simula School of Research and Innovation, Noruega
- **Interfaz**: Línea de comandos
- **Características Destacadas**: Virtual Classroom facilita la evaluación por pares y ofrece guías sobre cómo modificar su código para ajustarse a necesidades específicas. Aunque no tiene integración directa de retroalimentación, se apoya en el sistema de issues de GitHub para capturar comentarios de pares.

### 6. GHClass
- **Organización**: Universidad de Duke, EE.UU.
- **Interfaz**: Línea de comandos en R
- **Características Destacadas**: GHClass está diseñada para docentes que prefieren crear equipos y repositorios de manera personalizada. Integra el uso de Wercker CI para obtener retroalimentación continua a través de insignias de estado en los repositorios de los estudiantes.

### 7. ACAD
- **Organización**: Universidad de California, Santa Bárbara, EE.UU.
- **Interfaz**: Línea de comandos en Python
- **Características Destacadas**: ACAD permite la clonación masiva de repositorios de estudiantes y está optimizada para tareas individuales o en parejas. Ofrece funcionalidad básica sin soporte explícito para retroalimentación o evaluación avanzada.

### 8. Rhomboid
- **Organización**: Universidad de British Columbia, Canadá
- **Interfaz**: Línea de comandos en Python
- **Características Destacadas**: Rhomboid es una de las herramientas más avanzadas en términos de evaluación, permitiendo un flujo completo de creación, apertura, y cierre de asignaciones con retroalimentación integrada mediante rúbricas. Además, soporta la evaluación por pares, facilitando la colaboración y evaluación compartida entre estudiantes.

### Conclusión de la Comparativa
Glassey destaca que estas herramientas, aunque enfocadas en resolver problemas similares, varían en su nivel de sofisticación y facilidad de integración. Herramientas como GitHub Classroom y Repomate están bien adaptadas a la creación y manejo de tareas en grandes cursos, mientras que herramientas como Rhomboid y Virtual Classroom ofrecen una experiencia de retroalimentación y evaluación avanzada, aprovechando al máximo las características de GitHub para la educación.

> **Referencia**: Glassey, R. (2019). *Adopting Git/Github within Teaching: A Survey of Tool Support*. En *Proceedings of the ACM Global Computing Education Conference 2019*, Chengdu, Sichuan, China. DOI: 10.1145/3300115.3309518.


