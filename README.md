# Sistema de Auditoría de Repositorios de GitHub

Trabajo de Fin de Grado en Ingeniería Informática  
Autor: Juan José Cobo Cano  
Tutor: Manuel Masías Vergara  
Fecha: Mayo de 2025  
Universidad Europea del Atlántico

## Descripción del proyecto

Este sistema ha sido diseñado para mejorar la evaluación individual en proyectos colaborativos en GitHub, especialmente en entornos educativos donde el análisis objetivo de contribuciones es un reto.

El proyecto propone un conjunto de herramientas visuales e interactivas que permiten a los docentes auditar de manera más clara, precisa y eficiente el desempeño de los estudiantes.

## Objetivo general

Desarrollar una plataforma web que permita a los docentes analizar la evolución del código, visualizar patrones de trabajo y obtener métricas precisas de participación en repositorios GitHub utilizados en asignaturas universitarias.

## Funcionalidades destacadas

- Visualizador de estructura de repositorio: explora las carpetas y archivos de cualquier rama de un repositorio.
- Playback de commits: reproduce la evolución de un archivo línea a línea a lo largo del tiempo.
- Mapa de calor de autoría: representa visualmente qué usuarios han trabajado en qué archivos y con qué intensidad.
- Diagrama de burbujas: muestra gráficamente la actividad por usuario y archivo, facilitando la detección de patrones de colaboración.
- Análisis multidimensional: genera estadísticas detalladas por usuario, rama y tipo de contribución (commits, PRs, issues, comentarios).
- Visualizador de ramas y commits: permite comprender el flujo de trabajo mediante un grafo interactivo de ramas, merges y commits.

## Validación

El sistema aún está en desarrollo pero ya es funcional y se ha probado para el análisis de varios repositorios colaborativos comprobando:

- Facilitación de la evaluación de trabajos colaborativos.
- Optimización del tiempo empleado para evaluar repositorios colaborativos.

## Tecnologías utilizadas

- Backend: Node.js (Express)
- Frontend: React + TailwindCSS
- Base de datos: PostgreSQL
- Visualizaciones: D3.js / Chart.js
- Contenedores: Docker
- IA: Modelos de análisis de código tipo CodeLlama

## Organización del repositorio

├──Project/backend/ # Servidor Express y lógica de auditoría

├── Project/frontend/ # Aplicación React con todas las visualizaciones

├── documentación/ # Documentación técnica (aún no finalizada)




## Metodología

Este TFG ha sido desarrollado siguiendo la metodología ágil SCRUM, organizada en sprints funcionales que abarcaron desde la creación del sistema base hasta la validación en entornos reales.

## Contribuciones futuras

- Integración con GitHub Classroom
- Añadir métricas de calidad del código
- Soporte a más plataformas (GitLab, Bitbucket)
- Implementación de un modo profesor/alumno

## Contacto

Para más información sobre el proyecto o interés en colaborar:

juan.cobo@alumnos.uneatlantico.es


