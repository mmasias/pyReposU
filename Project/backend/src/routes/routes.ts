import { Application } from 'express';
import commitsRoutes from './commits.routes';
import statsRoutes from '.'; 
import filesRoutes from './files.routes';
import graphRoutes from './graph.routes';

/**
 * Configura todas las rutas de la aplicación.
 */
export const setupRoutes = (app: Application): void => {
  app.use('/api/commits', commitsRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api/files', filesRoutes); // Registrar rutas relacionadas con archivos
  app.use('/api/graph', graphRoutes);

};