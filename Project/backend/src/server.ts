import express, { Application } from 'express';
import bodyParser from 'body-parser';
import { setupRoutes } from './routes/routes';
import dotenv from 'dotenv';
import cors from 'cors';
import { setupSwagger } from './swagger';
import { errorHandler } from "./middleware/errorHandler";
import { config } from "./config/config";
import { sequelize } from './config/db';
import './models'; 

dotenv.config();

const app: Application = express();
const PORT = config.server.port;

// Configurar CORS
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middlewares
app.use(bodyParser.json());
app.use(errorHandler);

// Configurar rutas
setupRoutes(app);

// Swagger
setupSwagger(app);

// Conectar a la BBDD y arrancar el servidor
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado a PostgreSQL.");

    // EN DES:
    // await sequelize.sync({ alter: true }); // activa esto si quieres sincronizar tablas en caliente

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error al conectar a PostgreSQL:", err);
    process.exit(1);
  }
};

startServer();
