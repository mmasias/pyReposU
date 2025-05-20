FROM node:18

# netcat para esperar a PostgreSQL
RUN apt-get update && apt-get install -y netcat-openbsd

WORKDIR /app

# Copiamos solo los package.json y dependencias primero
COPY package*.json ./

# Instalamos TODO incluyendo devDependencies
RUN npm install --legacy-peer-deps --include=dev

# Copiamos todo el código
COPY . .

# Compilamos el backend
RUN npm run build

#copiar archivos estaticos:
COPY src/swagger.yaml ./dist/swagger.yaml

# Script de espera
RUN apt-get install -y dos2unix && dos2unix /app/wait-for.sh
RUN chmod +x wait-for.sh

# Exponemos el puerto
EXPOSE 5000

#  ejecutar lo ya compilado
CMD ["/app/wait-for.sh", "db", "npm", "run", "start"]
