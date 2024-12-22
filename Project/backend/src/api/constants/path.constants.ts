import path from 'path';

export const PATHS = {
  // Carpeta temporal donde se clona el repositorio
  TEMP_REPO: path.resolve(__dirname, '../../temp-repo'),

  // Carpeta de salida donde se generan los archivos JSON
  OUTPUT: path.resolve(__dirname, '../../output'),

  // Agrega más rutas si es necesario en el futuro
};
