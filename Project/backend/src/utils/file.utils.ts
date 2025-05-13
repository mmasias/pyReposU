import { readFile, remove } from 'fs-extra';
import { decode } from 'utf8';


/**
 * Normaliza rutas codificadas UTF-8 o Latin1.
 * Elimina comillas, reinterpreta secuencias octales y renombres estilo {a => b}
 * @param input Cadena a normalizar.
 * @returns Cadena limpia y legible.
 */
export const normalizePath = (input: string): string => {
  try {
    // Paso 1: Quitar comillas exteriores
    let cleaned = input.replace(/^"(.*)"$/, '$1');

    // Paso 2: Extraer path destino si es un rename estilo `{foo => bar}`
    cleaned = cleaned.replace(/\{.*=>\s*(.*?)\}/, '$1');

    // Paso 3: Detectar secuencias \303\241 (octal) => convertir a caracteres reales
    if (/\\\d{3}/.test(cleaned)) {
      cleaned = cleaned.replace(/\\(\d{3})/g, (_, oct) => {
        const charCode = parseInt(oct, 8);
        return String.fromCharCode(charCode);
      });

      // Paso 4: Intentar decodificar si parece Latin-1 mal codificado
      return decode(cleaned);
    }

    // Si no hay secuencias raras, simplemente retorna
    return cleaned;
  } catch (error) {
    console.error(`🛑 Error normalizando la ruta: ${input}`, error);
    return input;
  }
};
