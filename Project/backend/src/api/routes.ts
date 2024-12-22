import { Application } from 'express';
import commitsRoutes from './commits/commits.routes';
import statsRoutes from './stats/folders/stats.routes';
import filesRoutes from './files/files.routes'; // Ruta dedicada

/**
 * Configura todas las rutas de la aplicación.
 */
export const setupRoutes = (app: Application): void => {
  app.use('/api/commits', commitsRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api/files', filesRoutes); // Registrar rutas relacionadas con archivos
};