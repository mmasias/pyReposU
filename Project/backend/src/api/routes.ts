import { Application } from 'express';
import commitsRoutes from './commits/commits.routes';
import statsRoutes from './stats/folders/stats.routes';

export const setupRoutes = (app: Application): void => {
  app.use('/api/commits', commitsRoutes);
  app.use('/api/stats', statsRoutes);
};
