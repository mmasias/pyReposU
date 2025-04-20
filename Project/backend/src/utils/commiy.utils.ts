import path from "path";

/**
 * Convierte raw paths de Git (como en `git show`) en claves equivalentes a diffStats.
 */
export const parseGitFilePath = (input: string): string => {
  try {
    // 1. Quitar comillas al principio/final
    if (input.startsWith('"') && input.endsWith('"')) {
      input = input.slice(1, -1);
    }

    // 2. Si es un rename estilo {old => new}, extraer `new`
    const renameMatch = input.match(/\{.*?=>\s*(.*?)\}/);
    if (renameMatch) {
      input = input.replace(/\{.*?=>\s*(.*?)\}/, renameMatch[1]);
    }

    // 3. Reemplazar octales tipo \303\241 (á)
    input = input.replace(/\\([0-3][0-7]{2})/g, (_, oct) =>
      String.fromCharCode(parseInt(oct, 8))
    );

    // 4. Normalizar slashes
    return path.normalize(input).replace(/\\/g, "/").replace(/\/+/g, "/").trim();
  } catch (err) {
    console.warn(`[parseGitFilePath] Error con "${input}"`, err);
    return input;
  }
};
