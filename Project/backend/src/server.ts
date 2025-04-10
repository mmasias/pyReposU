import express, { Application } from 'express';
import bodyParser from 'body-parser';
import { setupRoutes } from './routes/routes';
import dotenv from 'dotenv';
import cors from 'cors';
import { setupSwagger } from '../src/swagger';  
import { errorHandler } from "./middleware/errorHandler";
import { config } from "./config/config";

dotenv.config(); //TODO REVISAR

const app: Application = express();
const PORT = config.server.port;

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
app.use(errorHandler);

// Configurar rutas
setupRoutes(app);

// Configurar Swagger
setupSwagger(app); // Configura Swagger

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
