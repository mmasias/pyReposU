export interface Commit {
    hash: string;
    message: string;
    date: string;
    author: string;
    files: string[]; // Archivos modificados (se implementará más adelante)
  }
  