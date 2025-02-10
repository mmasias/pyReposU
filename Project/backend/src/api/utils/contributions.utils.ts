import path from "path";

/**
 * Normaliza las rutas de archivos para evitar caracteres raros
 */
export const normalizePath = (filePath: string): string => {
  return path.normalize(filePath).replace(/\\/g, "/").trim();
};

/**
 * Verifica si un archivo es binario (imágenes, PDFs, etc.).
 */
export const isBinaryFile = (filePath: string): boolean => {
  return /\.(png|jpg|jpeg|gif|pdf|zip|mp3|mp4|mov|avi)$/i.test(filePath);
};