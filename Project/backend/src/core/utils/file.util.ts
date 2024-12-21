import { writeFile } from 'fs-extra';

export async function writeJSONFile(path: string, data: any) {
  try {
    await writeFile(path, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Archivo escrito exitosamente en: ${path}`);
  } catch (error) {
    console.error(`Error al escribir el archivo en ${path}:`, error);
    throw error;
  }
}
