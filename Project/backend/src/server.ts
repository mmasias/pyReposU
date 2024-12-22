import express, { Application } from 'express';
import bodyParser from 'body-parser';
import { setupRoutes } from './api/routes';
import dotenv from 'dotenv';
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Configurar rutas
setupRoutes(app);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
