# Resumen Extensivo: Automated Grading and Feedback Tools for Programming Education: A Systematic Review

## Resumen
El artículo realiza una revisión sistemática de 121 publicaciones entre 2017 y 2021 sobre herramientas de evaluación automatizada (AATs, *Automated Assessment Tools*) en la enseñanza de programación. Destaca cómo estas herramientas han evolucionado para ofrecer retroalimentación casi instantánea y evaluaciones consistentes en clases numerosas. Si bien la mayoría evalúan la corrección del código utilizando técnicas dinámicas como pruebas unitarias, pocas evalúan aspectos como la mantenibilidad, legibilidad o documentación, lo que representa un área significativa de mejora.

## Objetivo
Proveer un análisis detallado sobre las herramientas de evaluación automatizada, categorizándolas según:
1. Habilidades evaluadas (corrección, mantenibilidad, legibilidad, documentación).
2. Métodos utilizados (dinámicos, estáticos, aprendizaje automático).
3. Lenguajes soportados.
4. Comparación con evaluaciones humanas.
5. Técnicas de retroalimentación.

## Habilidades Evaluadas
Las herramientas se enfocan en:
1. **Corrección**: Pruebas unitarias y análisis estático para verificar funcionalidad o similitud estructural con soluciones modelo.
2. **Mantenibilidad**: Uso de métricas como la complejidad lógica o calidad de pruebas. Ejemplo: *Testing Tutor* enseña a crear suites de pruebas robustas.
3. **Legibilidad**: Chequeos de estilo, nombramiento consistente, y uso adecuado de comentarios.
4. **Documentación**: Escasa atención; usualmente se limita a verificar la existencia de comentarios o prácticas básicas.

## Métodos Utilizados
1. **Análisis Dinámico**: Mayormente pruebas unitarias.
   - Ejemplo: Herramientas que integran GitHub Actions o TravisCI para ejecutar pruebas.
2. **Análisis Estático**: Herramientas como linters (pylint, CheckStyle) para evaluar calidad de código y mantener estándares.
3. **Aprendizaje Automático (AA)**: Creciente interés en modelos que evalúan calidad del diseño y corrigen código basado en redes neuronales o árboles de sintaxis abstracta.

## Lenguajes Soportados
- **Predominancia en Programación Orientada a Objetos (OO, *Object-Oriented*)**: 69%, liderado por Java y Python debido a su uso en educación.
- **Funcionales y Lógicos**: Haskell, OCaml y Prolog en menor medida.
- **Dominios específicos**:
  - Gráficos (OpenGL).
  - SQL (análisis híbrido dinámico-estático).
  - Ensamblador y kernels (Linux).

## Comparación con Evaluaciones Humanas
1. **Exactitud**: Herramientas bien diseñadas igualan o superan en consistencia a evaluadores humanos.
2. **Correlación**: Relación positiva significativa entre notas humanas y automatizadas en varias investigaciones.
3. **Limitaciones**: Falta de evaluación holística, como creatividad o aspectos subjetivos.

## Beneficios
1. **Retroalimentación instantánea**: Mejora la satisfacción estudiantil y facilita iteraciones rápidas.
2. **Consistencia**: Reduce la variabilidad en evaluaciones humanas.
3. **Escalabilidad**: Adecuadas para grupos grandes.

## Desafíos Identificados
1. **Evaluación de habilidades complejas**: Mantenibilidad, legibilidad y documentación reciben poca atención.
2. **Curva de aprendizaje técnica**: Instructores y estudiantes enfrentan barreras al adoptar estas herramientas.
3. **Falta de datos abiertos**: Limita la reproducibilidad y comparación entre herramientas.


## Conclusión
El artículo resalta cómo las herramientas de evaluación automatizada están redefiniendo la enseñanza de programación. La integración de estas ideas en el proyecto puede aumentar la eficiencia y el valor pedagógico, especialmente mediante herramientas que combinen escalabilidad y retroalimentación inmediata, fomentando mejores prácticas entre estudiantes.
