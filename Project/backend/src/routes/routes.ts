import { Router, Application } from 'express';
import analisisMultidimensionalRoutes from './analisisMultidimensional.routes';
import mapaContribucionesRoutes from './mapaContribuciones.routes';
import mapaEvolucionRepoRoutes from './mapaEvolucionRepo.routes';
import visualizadorCodigoRoutes from './visualizadorCodigo.routes';
import commonRoutes from './common.routes';

const router = Router();

export const setupRoutes = (app: Application): void => {
  app.use('/api/analisisMultidimensional', analisisMultidimensionalRoutes);
  app.use('/api/mapaContribuciones', mapaContribucionesRoutes);
  app.use('/api/mapaEvolucionRepo', mapaEvolucionRepoRoutes);
  app.use('/api/visualizadorCodigo', visualizadorCodigoRoutes);
  app.use('/api/mapaEvolucionRepo', mapaEvolucionRepoRoutes);
  app.use('/api/common', commonRoutes); 
};

