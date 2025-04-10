import { readFile, remove } from 'fs-extra';
import { decode } from 'utf8';

/**
 * Lee un archivo JSON y lo devuelve como un objeto.
 * @param path Ruta del archivo JSON.
 * @returns Contenido del archivo como objeto.
 */
export const readJSONFile = async (path: string): Promise<any> => {
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    throw new Error(`Error leyendo el archivo ${path}: ${errorMessage}`);
  }
};

/**
 * Elimina un directorio y su contenido de forma asíncrona.
 * @param path Ruta del directorio a eliminar.
 */
export const removeDirectory = async (path: string): Promise<void> => {
  try {
    await remove(path);
    console.log(`Directorio eliminado: ${path}`);
  } catch (error) {
    console.error(`Error al eliminar el directorio ${path}:`, error);
    throw error;
  }
};

/**
 * Normaliza rutas codificadas UTF-8 o Latin1.
 * @param input Cadena a normalizar.
 * @returns Cadena normalizada.
 */
export const normalizePath = (input: string): string => {
  try {
    // Remover las comillas iniciales y finales si existen
    const withoutQuotes = input.replace(/^"(.*)"$/, '$1');

    // Detectar y reemplazar secuencias como \303\241 con su equivalente UTF-8
    const replaced = withoutQuotes.replace(/\\(\d{3})/g, (_, oct) => {
      const charCode = parseInt(oct, 8); // Convertir código octal a decimal
      return String.fromCharCode(charCode); // Generar el carácter correspondiente
    });

    // Decodificar posibles textos mal codificados
    return decode(replaced);
  } catch (error) {
    console.error(`Error normalizando la ruta: ${input}`, error);
    return input; // Retornar original si ocurre un error
  }
};

