# Metodología de Uso del Repositorio

## **1. Estructura de Ramas**

El repositorio utilizará una estrategia de ramificación basada en **Git Flow**, adaptada a las necesidades del proyecto.

### Ramas Principales
- **`main`**: 
  - Contiene la versión más estable y funcional del proyecto.
  - Solo se fusionan cambios completamente probados y aprobados.
- **`develop`**:
  - Ramas donde se integran nuevas funcionalidades antes de ser estabilizadas.
  - Punto intermedio entre desarrollo activo y preparación para producción.

### Ramas Secundarias
- **`feature/*`**:
  - Utilizadas para desarrollar nuevas características o módulos.
  - Ejemplo de nomenclatura: `feature/visualizador-codigo`.
- **`bugfix/*`**:
  - Para corregir errores detectados en `develop` o en un feature específico.
  - Ejemplo de nomenclatura: `bugfix/correccion-heatmap`.
- **`hotfix/*`**:
  - Usadas para solucionar problemas críticos en `main`.
  - Ejemplo de nomenclatura: `hotfix/arreglo-login`.
- **`release/*`**:
  - Para preparar nuevas versiones del proyecto antes de pasarlas a `main`.
  - Ejemplo de nomenclatura: `release/v1.0.0`.

---

## **2. Reglas para Commits**

### **Formato de Mensajes de Commit**
Se tratará de usar el formato **Conventional Commits** para estandarizar los mensajes:
```
<tipo>(alcance): descripción breve
```
Cuerpo del mensaje opcional para explicar detalles del cambio.

#### Tipos de Commit
- **`feat`**: Añade una nueva funcionalidad.
- **`fix`**: Soluciona un error.
- **`docs`**: Cambios en la documentación.
- **`style`**: Ajustes de formato o estilo (sin cambios funcionales).
- **`refactor`**: Modificaciones que mejoran el código sin cambiar su comportamiento.
- **`test`**: Añade o modifica pruebas.
- **`chore`**: Cambios menores o tareas auxiliares (e.g., actualizaciones de dependencias).

#### Ejemplo de Mensaje de Commit
```
feat(visualizador): añadir soporte para playback de commits

Se integró la funcionalidad de reproducción commit a commit en la vista detallada.
```

---

## **3. Flujo de Trabajo**

### **Proceso General**
1. Crear una rama basada en `develop`:
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/<nombre-del-feature>
   ```
2. Realizar commits pequeños y descriptivos siguiendo el formato estándar.
3. Asegurarse de que el código pase las pruebas locales:
   ```bash
   npm test
   ```
4. Enviar la rama al repositorio remoto:
   ```bash
   git push origin feature/<nombre-del-feature>
   ```
5. Abrir un Pull Request (PR) hacia develop:
   - Añadir descripción del cambio.
   - Asignar revisores y etiquetar el PR correctamente.
6. Fusionar el PR tras aprobación y pasar todas las pruebas.

#### Mantenimiento del Repositorio
- Realizar limpieza periódica de ramas obsoletas.
- Etiquetar y documentar todas las versiones importantes.

### Filtros y Etiquetas

#### Etiquetas para Issues/PRs
- **enhancement:** Nuevas funcionalidades.
- **bug:** Reporte o solución de errores.
- **documentation:** Cambios en documentación.
- **testing:** Relacionado con pruebas.
- **wontfix:** Cambios descartados.


