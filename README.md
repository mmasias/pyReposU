# 🚀 pyReposU – Análisis de Repositorios con IA y Docker

Este proyecto analiza la evolución de repositorios de código fuente mediante visualizaciones, análisis de cambios y herramientas de inteligencia artificial (Ollama + CodeLlama).

## 🧩 Tecnologías

- 🎨 **Frontend:** React + Vite + Tailwind CSS
- 🔙 **Backend:** Node.js + Express + TypeScript + Sequelize
- 🐘 **Base de datos:** PostgreSQL
- 🐳 **Contenedores:** Docker & Docker Compose

---

## ⚙️ Requisitos Previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado y funcionando
- [Git](https://git-scm.com/) (opcional, para clonar)

> ⚠️ **Windows + WSL2:** Asegúrate de tener al menos `5 GB de RAM` configurados para Docker.  
> Crea (si no existe) el archivo `%USERPROFILE%\.wslconfig` con el siguiente contenido:
>
> ```ini
> [wsl2]
> memory=5GB
> processors=4
> swap=2GB
> ```
> Reinicia Docker Desktop después de modificarlo.

---

## 🛠️ Cómo ejecutar la aplicación

1. **Clona el repositorio**
    ```bash
    git clone <URL-del-repositorio>
    cd Project  # o el nombre del directorio raíz
    ```

2. **Configura las variables de entorno (solo backend)**
    ```bash
    cd backend
    cp .env.ejemplo .env
    ```
    Contenido esperado de `.env`:
    ```ini
    DB_HOST=db
    DB_USER=postgres
    DB_PASS=0000
    DB_NAME=githubDB
    ```

3. **Levanta la aplicación con Docker**
    Desde la raíz del proyecto:
    ```bash
    docker-compose up --build
    ```

    Esto iniciará automáticamente:

    | Servicio   | URL de acceso           | Descripción                        |
    |------------|------------------------|------------------------------------|
    | Frontend   | http://localhost       | UI React para explorar repos       |
    | Backend    | http://localhost:5000  | API REST y análisis IA             |
    | PostgreSQL | localhost:5432         | Base de datos relacional           |

---

## ✅ Primer uso

1. Abre [http://localhost](http://localhost)
2. Introduce un repositorio de GitHub (ej: `https://github.com/usuario/repositorio.git`)
3. Interacciona con las distintas herramientas

---




