import { Parser } from 'json2csv';
import { getUserStats } from './userStatsService';

export const generateUserStatsCSV = async (
  repoUrl: string,
  branch?: string,
  startDate?: string,
  endDate?: string
): Promise<string> => {
  const stats = await getUserStats(repoUrl, branch || 'all', startDate || '', endDate || '');
  const fields = ['user', 'totalContributions', 'commits', 'linesAdded', 'linesDeleted', 'pullRequests', 'issues', 'comments'];
  const json2csv = new Parser({ fields });
  return json2csv.parse(stats);
};
