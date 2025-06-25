export const getTreeFromCache = (repoUrl: string, branch = "HEAD"): any[] | null => {
  const prefix = `treeCache::${repoUrl}`;
  const matchKey = Object.keys(localStorage).find(k => k.startsWith(prefix) && k.includes(`::${branch}`));
  if (!matchKey) return null;

  try {
    const parsed = JSON.parse(localStorage.getItem(matchKey)!);
    return [...parsed.subfolders, { files: parsed.files || [] }];
  } catch (e) {
    console.warn("⚠️ Error al leer árbol desde localStorage:", e);
    return null;
  }
};
