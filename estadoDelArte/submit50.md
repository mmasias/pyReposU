# submit50 - Sistema de Gestión de Entregas 

## Descripción General
`submit50` es una herramienta desarrollada específicamente para el curso CS50 de la Universidad de Harvard, diseñado para simplificar y estandarizar la entrega de proyectos. Está integrada en GitHub y permite a los estudiantes subir sus trabajos directamente al repositorio del curso, facilitando el proceso tanto para estudiantes como para profesores.

## Objetivos de submit50
- **Facilitar las entregas**: Simplifica el proceso de entrega de código mediante comandos específicos en línea de comandos, permitiendo a los estudiantes entregar sus proyectos directamente desde su entorno de desarrollo.
- **Automatizar el feedback**: Al integrarse con GitHub Actions, `submit50` permite realizar pruebas automáticas y notificar a los estudiantes sobre el estado de su código.
- **Asegurar autenticidad**: Al utilizar GitHub para gestionar las entregas, submit50 permite al curso verificar la autoría y detectar intentos de plagio o colaboración no autorizada.
- **Estandarización y control**: Proporciona una interfaz uniforme que se ajusta a las políticas y criterios del curso.

## Principales Funcionalidades
1. **Comando simplificado de entrega**
   - Los estudiantes ejecutan un comando único para cargar su proyecto al curso sin necesidad de interacción adicional con GitHub, lo que agiliza el flujo de trabajo y minimiza errores.
   
2. **Automatización de pruebas**
   - Cada entrega dispara una serie de pruebas automáticas en GitHub Actions. Estos tests pueden verificar la sintaxis, la estructura del código y validar ciertos requisitos, dando feedback instantáneo al estudiante sobre su progreso.
   
3. **Rastreo de versiones**
   - `submit50` guarda cada entrega como un commit en GitHub, permitiendo a los estudiantes y al equipo del curso rastrear cambios y revisar el historial de desarrollo del proyecto.
   
4. **Feedback estructurado**
   - El feedback es automatizado y estructurado, y cada entrega incluye un resumen de los resultados de las pruebas y recomendaciones de mejora. Esto fomenta un enfoque iterativo en el aprendizaje, alentando a los estudiantes a corregir y optimizar sus soluciones.

## Beneficios Educativos
- **Fomento de prácticas profesionales**: Los estudiantes desarrollan competencias en control de versiones y en el uso de Git y GitHub, herramientas esenciales en la industria de software.
- **Feedback inmediato**: Permite a los estudiantes recibir retroalimentación en tiempo real, lo cual es valioso para mejorar y aprender de los errores rápidamente.
- **Transparencia y trazabilidad**: Con el historial de cambios y la documentación de cada entrega, los estudiantes y profesores pueden ver la evolución de cada proyecto.

## Inspiración para el Proyecto
`submit50` sirve como modelo para:
- **Automatización de entregas y feedback**: Integrar un sistema que permita entregas de código con un solo comando y que ejecute pruebas automáticas.
- **Rastreo de progreso y cambios**: Documentar cada entrega como un commit para mejorar la transparencia y la revisión del progreso.
- **Experiencia de usuario simplificada**: Crear comandos que minimicen los pasos necesarios para la entrega y fomenten un flujo de trabajo sin complicaciones.

Integrar estas ideas en tu proyecto no solo mejoraría la experiencia de los estudiantes, sino que también optimizaría el proceso de evaluación y revisión por parte de los profesores, aportando valor al sistema educativo.

---
