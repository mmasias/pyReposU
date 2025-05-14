# 1. Imagen base de Node con soporte para TypeScript
FROM node:18

# 2. Instalamos netcat para que wait-for.sh funcione
RUN apt-get update && apt-get install -y netcat-openbsd

# 3. Directorio de trabajo
WORKDIR /app

# 4. Copiamos los package.json para instalar dependencias primero (cache-friendly)
COPY package*.json ./

# 5. Instalamos dependencias
RUN npm install

# 6. Copiamos el resto del código
COPY . .

# 7. Compilamos TypeScript (opcional, si usas dist/)
# RUN npm run build

# 8. Exponemos el puerto donde corre tu backend
EXPOSE 5000

# 9. Copiamos el script de espera y le damos permisos
COPY wait-for.sh .
RUN chmod +x wait-for.sh

# 10. Comando de arranque: esperamos a PostgreSQL antes de levantar backend
CMD ["./wait-for.sh", "db", "npm", "run", "dev"]
