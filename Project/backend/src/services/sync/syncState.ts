
import { CommitSyncState } from "../../models/CommitSyncState";

export const wasProcessed = async (entityId: number, type: string): Promise<boolean> => {
  const found = await CommitSyncState.findOne({
    where: { commitId: entityId, type },
  });
  return !!found;
};

export const markProcessed = async (entityId: number, type: string): Promise<void> => {
  await CommitSyncState.findOrCreate({
    where: { commitId: entityId, type },
    defaults: { processedAt: new Date() },
  });
};
