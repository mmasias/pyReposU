import { Application } from 'express';
import commitsRoutes from './commits/commits.routes';
import statsRoutes from './stats'; 
import filesRoutes from './files/files.routes'; 

/**
 * Configura todas las rutas de la aplicación.
 */
export const setupRoutes = (app: Application): void => {
  app.use('/api/commits', commitsRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api/files', filesRoutes); // Registrar rutas relacionadas con archivos
};