export interface SyncOptions {
  syncCommits?: boolean;
  syncDiffs?: boolean;
  syncStats?: boolean;
  syncGithubActivityOption?: boolean;
  forceSyncNow?: boolean;
  lightSync?: boolean; // <- AÑADIR ESTO
}
