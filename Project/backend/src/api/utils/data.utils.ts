/**
 * Normaliza una ruta de archivo a formato estándar.
 */
export const normalizeFilePath = (filePath: string): string => {
    return filePath.replace(/\\/g, "/").trim();
  };
  
  /**
   * Formatea un número grande con separadores de miles.
   */
  export const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };
  
  /**
   * Calcula el porcentaje de contribución de un usuario sobre el total.
   */
  export const calculatePercentage = (part: number, total: number): number => {
    return total === 0 ? 0 : (part / total) * 100;
  };
  