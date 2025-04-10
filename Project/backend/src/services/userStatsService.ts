import { Op } from 'sequelize';
import { Commit } from '../models/Commit';
import { CommitFile } from '../models/CommitFile';
import { Repository } from '../models/Repository';
import { User } from '../models/User';
import { PullRequest } from '../models/PullRequest';
import { Issue } from '../models/Issue';
import { Comment } from '../models/Comment';
import { Parser } from 'json2csv';

interface UserStats {
  user: string;
  totalContributions: number;
  commits: number;
  linesAdded: number;
  linesDeleted: number;
  pullRequests: number;
  issues: number;
  comments: number;
}

export const getUserStats = async (
  repoUrl: string,
  branch?: string,
  startDate?: string,
  endDate?: string
): Promise<UserStats[]> => {
  const repo = await Repository.findOne({ where: { url: repoUrl } });
  if (!repo) throw new Error(`Repositorio no encontrado: ${repoUrl}`);

  const commitWhere: any = { repositoryId: repo.id };
  if (startDate) commitWhere.date = { [Op.gte]: new Date(startDate) };
  if (endDate) {
    commitWhere.date = commitWhere.date
      ? { ...commitWhere.date, [Op.lte]: new Date(endDate) }
      : { [Op.lte]: new Date(endDate) };
  }

  const commits = await Commit.findAll({
    where: commitWhere,
    include: [User],
  });

  const statsMap: Record<string, UserStats> = {};

  for (const commit of commits) {
    const authorLogin = commit.User?.githubLogin || 'Desconocido';

    if (!statsMap[authorLogin]) statsMap[authorLogin] = createEmptyStats(authorLogin);

    const files = await CommitFile.findAll({ where: { commitId: commit.id } });

    const addedLines = files.reduce((acc, f) => acc + (f.linesAdded || 0), 0);
    const deletedLines = files.reduce((acc, f) => acc + (f.linesDeleted || 0), 0);

    statsMap[authorLogin].commits += 1;
    statsMap[authorLogin].linesAdded += addedLines;
    statsMap[authorLogin].linesDeleted += deletedLines;
    statsMap[authorLogin].totalContributions += 1;
  }

  // Pull Requests, Issues y Comments (basado en modelo relacional)
  const prs = await PullRequest.findAll({ where: { repositoryId: repo.id } });
  const issues = await Issue.findAll({ where: { repositoryId: repo.id } });
  const comments = await Comment.findAll({ where: { repositoryId: repo.id } });

  for (const pr of prs) {
    const user = await User.findByPk(pr.userId);
    const login = user?.githubLogin || 'Desconocido';
    if (!statsMap[login]) statsMap[login] = createEmptyStats(login);
    statsMap[login].pullRequests += 1;
  }

  for (const issue of issues) {
    const user = await User.findByPk(issue.userId);
    const login = user?.githubLogin || 'Desconocido';
    if (!statsMap[login]) statsMap[login] = createEmptyStats(login);
    statsMap[login].issues += 1;
  }

  for (const comment of comments) {
    const user = await User.findByPk(comment.userId);
    const login = user?.githubLogin || 'Desconocido';
    if (!statsMap[login]) statsMap[login] = createEmptyStats(login);
    statsMap[login].comments += 1;
  }

  return Object.values(statsMap);
};

export const getRepoGeneralStats = async (repoUrl: string) => {
  const repo = await Repository.findOne({ where: { url: repoUrl } });
  if (!repo) throw new Error(`Repositorio no encontrado: ${repoUrl}`);

  const prs = await PullRequest.findAll({ where: { repositoryId: repo.id } });
  const issues = await Issue.findAll({ where: { repositoryId: repo.id } });
  const comments = await Comment.findAll({ where: { repositoryId: repo.id } });

  const statsMap: Record<string, { pullRequests: number; issues: number; comments: number }> = {};

  for (const pr of prs) {
    const user = await User.findByPk(pr.userId);
    const login = user?.githubLogin || 'Desconocido';
    statsMap[login] ||= { pullRequests: 0, issues: 0, comments: 0 };
    statsMap[login].pullRequests += 1;
  }

  for (const issue of issues) {
    const user = await User.findByPk(issue.userId);
    const login = user?.githubLogin || 'Desconocido';
    statsMap[login] ||= { pullRequests: 0, issues: 0, comments: 0 };
    statsMap[login].issues += 1;
  }

  for (const comment of comments) {
    const user = await User.findByPk(comment.userId);
    const login = user?.githubLogin || 'Desconocido';
    statsMap[login] ||= { pullRequests: 0, issues: 0, comments: 0 };
    statsMap[login].comments += 1;
  }

  return statsMap;
};

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

function createEmptyStats(user: string): UserStats {
  return {
    user,
    totalContributions: 0,
    commits: 0,
    linesAdded: 0,
    linesDeleted: 0,
    pullRequests: 0,
    issues: 0,
    comments: 0,
  };
}
