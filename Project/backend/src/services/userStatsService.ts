import { Op } from 'sequelize';
import { Commit } from '../models/Commit';
import { CommitFile } from '../models/CommitFile';
import { Repository } from '../models/Repository';
import { User } from '../models/User';
import { PullRequest } from '../models/PullRequest';
import { Issue } from '../models/Issue';
import { Comment } from '../models/Comment';
import { Parser } from 'json2csv';
import { Branch, CommitBranch } from '../models';
import { UserRepoStats } from '../models/UserRepoStats';
import { wasProcessed, markProcessed } from './syncState';
import { CommitSyncState } from '../models/CommitSyncState';
import { AppError } from "../middleware/errorHandler";

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

function parseSafeDate(input?: string | null, fallback: Date = new Date('1970-01-01')): Date {
  if (!input || input.trim() === '') return fallback;
  const date = new Date(input);
  return isNaN(date.getTime()) ? fallback : date;
}

export const getUserStats = async (
  repoUrl: string,
  branch: string = 'all',
  startDate?: string,
  endDate?: string
): Promise<UserStats[]> => {
  const repo = await Repository.findOne({ where: { url: repoUrl } });
  if (!repo) throw new AppError("REPO_NOT_FOUND", `Repositorio no encontrado: ${repoUrl}`, 404);

  const start = parseSafeDate(startDate);
  const end = parseSafeDate(endDate, new Date());

  const whereClause: any = {
    repositoryId: repo.id,
    startDate: start,
    endDate: end,
    branch,
  };

  const cachedStats = await UserRepoStats.findAll({ where: whereClause });

  // 🧠 Obtener commits en el rango
  const commitWhere: any = {
    repositoryId: repo.id,
    date: { [Op.gte]: start, [Op.lte]: end },
  };

  if (branch !== 'all') {
    const branchRecord = await Branch.findOne({ where: { name: branch, repositoryId: repo.id } });
  if (!branchRecord) throw new AppError("BRANCH_NOT_FOUND", `Rama no encontrada: ${branch}`, 404);

    const commitBranchLinks = await CommitBranch.findAll({
      where: { branchId: branchRecord.id },
    });
    const commitIds = commitBranchLinks.map(cb => cb.commitId);
    commitWhere.id = commitIds;
  }

  const commits = await Commit.findAll({ where: commitWhere, include: [User] });
  const commitIds = commits.map(c => c.id);

  // 🔍 Verificar si todos los commits tienen `stats` procesado
  const processedStats = await CommitSyncState.findAll({
    where: {
      commitId: { [Op.in]: commitIds },
      type: 'stats',
    },
    attributes: ['commitId'],
  });

  const processedCommitIds = new Set(processedStats.map(p => p.commitId));
  const allHaveStats = commitIds.every(id => processedCommitIds.has(id));

  if (cachedStats.length > 0 && allHaveStats) {
    console.log(`[STATS] Usando caché UserRepoStats + CommitSyncState ✅`);
    const usersById: Record<number, string> = {};
    for (const stat of cachedStats) {
      if (!usersById[stat.userId]) {
        const user = await User.findByPk(stat.userId);
        usersById[stat.userId] = user?.githubLogin || 'Desconocido';
      }
    }

    return cachedStats.map(s => ({
      user: usersById[s.userId] || 'Desconocido',
      totalContributions: s.totalContributions,
      commits: s.commits,
      linesAdded: s.linesAdded,
      linesDeleted: s.linesDeleted,
      pullRequests: s.pullRequests,
      issues: s.issues,
      comments: s.comments,
    }));
  }

  // ⛏️ Procesamiento en vivo
  const statsMap: Record<string, UserStats> = {};

  for (const commit of commits) {
    const user = commit.User;
    if (!user) continue;

    const login = user.githubLogin;
    statsMap[login] ||= createEmptyStats(login);

    const files = await CommitFile.findAll({ where: { commitId: commit.id } });
    const addedLines = files.reduce((acc, f) => acc + (f.linesAdded || 0), 0);
    const deletedLines = files.reduce((acc, f) => acc + (f.linesDeleted || 0), 0);

    statsMap[login].commits += 1;
    statsMap[login].linesAdded += addedLines;
    statsMap[login].linesDeleted += deletedLines;
    statsMap[login].totalContributions += 1;
  }

  // PRs
  const prs = await PullRequest.findAll({
    where: {
      repositoryId: repo.id,
      createdAt: { [Op.gte]: start, [Op.lte]: end },
    },
  });

  for (const pr of prs) {
    const user = await User.findByPk(pr.userId);
    if (!user) continue;
    const login = user.githubLogin;
    statsMap[login] ||= createEmptyStats(login);
    statsMap[login].pullRequests += 1;
  }

  // Issues
  const issues = await Issue.findAll({
    where: {
      repositoryId: repo.id,
      createdAt: { [Op.gte]: start, [Op.lte]: end },
    },
  });

  for (const issue of issues) {
    const user = await User.findByPk(issue.userId);
    if (!user) continue;
    const login = user.githubLogin;
    statsMap[login] ||= createEmptyStats(login);
    statsMap[login].issues += 1;
  }

  // Comments
  const comments = await Comment.findAll({
    where: {
      repositoryId: repo.id,
      createdAt: { [Op.gte]: start, [Op.lte]: end },
    },
  });

  for (const comment of comments) {
    const user = await User.findByPk(comment.userId);
    if (!user) continue;
    const login = user.githubLogin;
    statsMap[login] ||= createEmptyStats(login);
    statsMap[login].comments += 1;
  }

  // 💾 Guardar resultado
  for (const [login, stat] of Object.entries(statsMap)) {
    const user = await User.findOne({ where: { githubLogin: login } });
    if (!user) continue;
    await UserRepoStats.create({
      repositoryId: repo.id,
      userId: user.id,
      branch,
      startDate: start,
      endDate: end,
      ...stat,
    });
  }

  console.log(`[STATS] Stats actualizados para repo ${repoUrl} ✅`);
  return Object.values(statsMap);
};

export const getRepoGeneralStats = async (repoUrl: string, startDate?: string, endDate?: string) => {
  const repo = await Repository.findOne({ where: { url: repoUrl } });
  if (!repo) throw new AppError("REPO_NOT_FOUND", `Repositorio no encontrado: ${repoUrl}`, 404);

  const start = parseSafeDate(startDate);
  const end = parseSafeDate(endDate, new Date());

  const prs = await PullRequest.findAll({
    where: {
      repositoryId: repo.id,
      createdAt: { [Op.gte]: start, [Op.lte]: end },
    },
  });

  const issues = await Issue.findAll({
    where: {
      repositoryId: repo.id,
      createdAt: { [Op.gte]: start, [Op.lte]: end },
    },
  });

  const comments = await Comment.findAll({
    where: {
      repositoryId: repo.id,
      createdAt: { [Op.gte]: start, [Op.lte]: end },
    },
  });

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
