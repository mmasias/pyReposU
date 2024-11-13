## GitHub in the Classroom: Lessons Learnt

### Resumen
El artículo examina cómo GitHub y GitHub Classroom (GHC) se utilizan en diversos cursos de programación y desarrollo de software en la Universidad de Auckland. A través de la experiencia acumulada en múltiples clases y niveles, los autores exponen los beneficios, desafíos y mejores prácticas de integrar GHC en la enseñanza universitaria de ciencias de la computación.

### Objetivo
El estudio tiene como objetivo compartir lecciones aprendidas en la implementación de GitHub y GHC en cursos universitarios, proporcionando una guía para otros educadores sobre cómo estos sistemas pueden optimizar la enseñanza y la evaluación en programación y desarrollo de software.

### Principales Lecciones Aprendidas
1. **Instrucción para Principiantes en Git**: Los estudiantes sin experiencia previa enfrentan dificultades al comenzar. Se recomienda proporcionar archivos `.gitignore` y enseñar su uso para evitar que los estudiantes cometan errores comunes al incluir archivos innecesarios en los repositorios.

2. **Selección de Flujos de Trabajo de Git**: Para novatos, el flujo de trabajo de ramas de características es más adecuado, ya que su simplicidad reduce la complejidad y el riesgo de conflictos de fusión, en comparación con otros flujos como "fork and pull".

3. **Evaluación y Retroalimentación en GHC**:
   - **GHC Autograding**: La herramienta permite la corrección automática mediante GitHub Actions, aunque limitada a ciertos tipos de pruebas.
   - **Procesamiento Automático Offline**: Permite aplicar pruebas automáticas personalizadas, adecuadas para configuraciones específicas del curso.
   - **Feedback con Pull Requests**: GHC permite crear PRs para cada estudiante, donde los instructores pueden ofrecer retroalimentación detallada en el código, aunque esto es costoso en términos de tiempo en clases grandes.

4. **Uso de GitHub Actions y Limitaciones**: GHC proporciona un límite de 2000 minutos mensuales para procesos de integración continua (CI), lo cual puede ser insuficiente si los estudiantes dependen del CI para realizar pruebas, especialmente cerca de fechas de entrega.

5. **Protección de Ramas y Derechos de Administración**: Para cursos avanzados, es beneficioso permitir a los estudiantes establecer sus propios flujos de trabajo y configuraciones de rama; sin embargo, para cursos de nivel básico, se deben limitar ciertos permisos para evitar la pérdida de datos o conflictos en los repositorios.

6. **Integración con LMS y Sincronización de Estudiantes**: GHC facilita la vinculación de cuentas de estudiantes con LMS como Canvas, lo cual es útil para grandes clases, aunque no sin ciertas limitaciones en el control de identificación y acceso de estudiantes.

### Conclusión
Los autores concluyen que, si bien GitHub y GHC requieren una inversión inicial en instrucción y configuración, su uso aporta un valor significativo a la enseñanza de programación, facilitando el aprendizaje práctico y la evaluación automatizada. Aconsejan evaluar el nivel de experiencia de los estudiantes al decidir qué herramientas y flujos de trabajo emplear, destacando que, aunque GHC es idóneo para cursos de pregrado, GitHub puede ser más apropiado para cursos avanzados y de posgrado.

> **Referencia**: Tu, Y.-C., Terragni, V., Tempero, E., Shakil, A., Meads, A., Giacaman, N., Fowler, A., & Blincoe, K. (2022). *GitHub in the Classroom: Lessons Learnt*. En *Australasian Computing Education Conference (ACE '22)*, Virtual Event, Australia. DOI: 10.1145/3511861.3511879.
