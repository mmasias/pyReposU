import { diffLines } from "diff";

/**
 * Genera un diff unificado simple entre dos versiones de un archivo
 */
export const generateFileDiff = (oldContent: string, newContent: string): string => {
  const diffs = diffLines(oldContent, newContent);
  return diffs
    .map(part => {
      const prefix = part.added ? "+ " : part.removed ? "- " : "  ";
      return part.value
        .split("\n")
        .filter(Boolean)
        .map(line => prefix + line)
        .join("\n");
    })
    .join("\n");
};
