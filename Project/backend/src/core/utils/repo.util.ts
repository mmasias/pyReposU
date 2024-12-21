import { existsSync } from 'fs-extra';

/**
 * Valida si el repositorio local existe en la ruta especificada.
 * @param path - Ruta del repositorio local.
 * @returns Booleano indicando si la ruta es válida.
 */
export function isLocalRepoValid(path: string): boolean {
  return existsSync(path);
}