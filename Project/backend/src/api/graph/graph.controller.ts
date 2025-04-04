import { Request, Response, RequestHandler } from 'express';
import { getRepoGraphService } from '../services/graph/graph.service';

export const getRepoGraphController: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const repoUrl = req.query.url as string;

  if (!repoUrl) {
    res.status(400).json({ error: 'Falta el parámetro url' });
    return;
  }

  try {
    const graph = await getRepoGraphService(repoUrl);
    res.json(graph);
  } catch (error: any) {
    console.error(`[getRepoGraphController] Error:`, error);
    res.status(500).json({ error: 'Error al procesar el repositorio' });
  }
};
