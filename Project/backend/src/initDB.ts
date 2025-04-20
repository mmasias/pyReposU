// src/initDb.ts
import { sequelize } from './config/db';
import './models'; 

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión con PostgreSQL exitosa.");

    //  Esto crea las tablas (¡solo en des)
    await sequelize.sync({ alter: true }); // También puedes usar force: true para recrear

    console.log("✅ Tablas sincronizadas correctamente.");
  } catch (error) {
    console.error("❌ Error al sincronizar DB:", error);
  } finally {
    await sequelize.close();
  }
})();
