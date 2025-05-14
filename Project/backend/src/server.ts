import express, { Application } from 'express';
import bodyParser from 'body-parser';
import { setupRoutes } from './routes/routes';
import dotenv from 'dotenv';
import cors from 'cors';
import { setupSwagger } from './swagger';
import { errorHandler } from "./middleware/errorHandler";
import { config } from "./config/config";
import { sequelize } from './config/db';
import './models'; // <-- MUY IMPORTANTE que esté aquí para registrar modelos

dotenv.config();

const app: Application = express();
const PORT = Number(config.server.port);

// Configurar CORS
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middlewares
app.use(bodyParser.json());
app.use(errorHandler);

// Rutas
setupRoutes(app);

// Swagger
setupSwagger(app);

// 🔥 Arranque
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado a PostgreSQL.");

    await sequelize.sync({ alter: true }); // O force: true SOLO para pruebas

    console.log("📦 Modelos sincronizados correctamente.");

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error al conectar a PostgreSQL:", err);
    process.exit(1);
  }
};

startServer();
