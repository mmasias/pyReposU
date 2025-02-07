import express, { Application } from 'express';
import bodyParser from 'body-parser';
import { setupRoutes } from './api/routes';
import dotenv from 'dotenv';
import cors from 'cors';
import { setupSwagger } from '../src/swagger';  

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS antes de cualquier middleware o ruta
app.use(
  cors({
    origin: 'http://localhost:5173', // Permitir solo desde tu frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Headers permitidos
  })
);

// Middleware
app.use(bodyParser.json());

// Configurar rutas
setupRoutes(app);

// Configurar Swagger
setupSwagger(app); // Configura Swagger

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
