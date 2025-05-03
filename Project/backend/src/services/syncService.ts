import { User } from "../models/User";
import { CommitBranch } from "../models/CommitBranch";
import { CommitParent } from "../models/CommitParent";
import { PullRequest } from '../models/PullRequest';
import axios, { AxiosResponse } from 'axios';
import { Repository } from '../models/Repository';
import { Issue } from '../models/Issue';
import { Comment } from "../models";
import { Branch as BranchModel } from "../models/Branch";
import simpleGit from "simple-git";
import { prepareRepo } from "../utils/gitRepoUtils";
import { Repository as RepositoryModel } from "../models/Repository";
import { Branch } from "../models/Branch";
import { BranchStats } from "../models/BranchStats";
import { ContributionCache } from "../models/ContributionCache";
import { syncCommits } from "./sync/syncCommits";
import { syncStatsOnly } from "./sync/syncStatsOnly";
import { syncDiffsOnly } from "./sync/syncDiffsOnly";
import { SyncOptions } from "../types/syncOptions";
import { wasProcessed } from "./syncState";
import { markProcessed } from "./syncState";
const syncingRepos = new Set<string>();
const syncingRepoPromises: Map<string, Promise<void>> = new Map();

export const syncRepoIfNeeded = async (
  repoUrl: string,
  options: SyncOptions = {}
): Promise<void> => {
  console.log(`[syncRepoIfNeeded] Opciones recibidas:`, options);

  if (syncingRepoPromises.has(repoUrl)) {
    console.log(`[SYNC] Esperando a que termine la sincronización en curso para ${repoUrl}... ⏳`);
    return await syncingRepoPromises.get(repoUrl);
  }

  const syncPromise = (async () => {
    syncingRepos.add(repoUrl);
    try {
      const shouldSyncCommits = options.syncCommits ?? true;
      const syncStats = options.syncStats ?? false;
      const syncDiffs = options.syncDiffs ?? false;
      const syncGithubActivityOption = options.syncGithubActivityOption ?? true;

      let repo = await RepositoryModel.findOne({ where: { url: repoUrl } });

      if (!repo) {
        const [, owner, nameRaw] = new URL(repoUrl).pathname.split("/");
        const name = nameRaw.replace(/\.git$/, "");
        await RepositoryModel.create({ url: repoUrl, owner, name });

        let attempts = 0;
        while (!repo && attempts < 5) {
          repo = await RepositoryModel.findOne({ where: { url: repoUrl } });
          if (!repo) await new Promise(res => setTimeout(res, 300));
          attempts++;
        }

        if (!repo) throw new Error(`No se pudo encontrar el repo recién creado: ${repoUrl}`);
      }

      console.time(`[PREPARE] ${repoUrl}`);
      const localPath = await prepareRepo(repoUrl);
      console.timeEnd(`[PREPARE] ${repoUrl}`);

      await syncBranches(repo, localPath);

      // 🔁 Modularized sync flow
      if (shouldSyncCommits) {
        await syncCommits(repo, localPath, { syncStats });
      }

      if (syncStats) {
        await syncStatsOnly(repo, localPath);
      }

      if (syncDiffs) {
        await syncDiffsOnly(repo, localPath);
      }

      if (syncGithubActivityOption) {
        console.log('[SYNC] Forzando sincronización de actividad de GitHub...');
        await syncGithubActivity(repoUrl);
      }

    } catch (error) {
      console.error(`[SYNC] ❌ Error durante sincronización de ${repoUrl}:`, error);
      throw error;
    } finally {
      syncingRepos.delete(repoUrl);
      syncingRepoPromises.delete(repoUrl);
    }
  })();

  syncingRepoPromises.set(repoUrl, syncPromise);
  return await syncPromise;
};



export const syncBranches = async (repo: Repository, localPath: string): Promise<void> => {
  const git = simpleGit(localPath);
  const remoteBranches = await git.branch(['-r']);
  const existing = await BranchModel.findAll({ where: { repositoryId: repo.id } });
  const existingSet = new Set(existing.map(b => b.name));

  for (const remoteBranchName of Object.keys(remoteBranches.branches)) {
    const cleanName = remoteBranchName.replace(/^origin\//, "").trim();
    if (!existingSet.has(cleanName)) {
      await BranchModel.create({ name: cleanName, repositoryId: repo.id });
      console.log(`[SYNC] Rama registrada: ${cleanName}`);
    }
  }
};





export const syncGithubActivity = async (repoUrl: string): Promise<void> => {
  console.log('[🔥 DEBUG] Entrando en syncGithubActivity con URL:', repoUrl);

  const [, owner, nameRaw] = new URL(repoUrl).pathname.split('/');
  const name = nameRaw.replace(/\.git$/, '');
  const repo = await Repository.findOne({ where: { url: repoUrl } });
  if (!repo) throw new Error(`Repositorio no encontrado: ${repoUrl}`);
  
  const wasGithubDone = await wasProcessed(repo.id, "github");
  
  if (wasGithubDone) {
    console.log("[SYNC] Actividad de GitHub ya sincronizada anteriormente ✅");
    return;
  }
  if (!repo) throw new Error(`Repositorio no encontrado: ${repoUrl}`);

  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  };

  //  Pull Requests
  const prs = await getAllPages(`https://api.github.com/repos/${owner}/${name}/pulls?state=all`, headers);
  console.log(`[SYNC] Total PRs desde GitHub: ${prs.length}`);
  
  for (const pr of prs) {
    try {
      if (!pr.user || !pr.user.login) {
        console.warn(`[SYNC] PR sin usuario válido: ${JSON.stringify(pr, null, 2)}`);
        continue;
      }
  
      const [user, userCreated] = await User.findOrCreate({
        where: { githubLogin: pr.user.login },
        defaults: { name: pr.user.login, email: '' },
      });
  
      if (userCreated) {
        console.log(`[SYNC] Nuevo usuario creado para PR: ${user.githubLogin}`);
      }
  
      const [pullRequest, created] = await PullRequest.findOrCreate({
        where: { githubId: pr.id },
        defaults: {
          userId: user.id,
          repositoryId: repo.id,
          title: pr.title,
          state: pr.state,
          createdAt: new Date(pr.created_at),
          closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
          mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
          commentsCount: pr.comments,
          additions: pr.additions,
          deletions: pr.deletions,
        },
      });
  
      if (created) {
        console.log(`[SYNC] PR creado: ${pr.title} by ${user.githubLogin}`);
      } else {
        console.log(`[SYNC] PR ya existente: ${pr.title} by ${user.githubLogin}`);
      }
  
    } catch (err) {
      console.error(`[SYNC][ERROR] PR fallo al sincronizar PR ${pr.id}:`, err);
    }
  }
  

  //  Issues
  const issues = await getAllPages(`https://api.github.com/repos/${owner}/${name}/issues?state=all`, headers);
  console.log(`[SYNC] Total Issues desde GitHub: ${issues.length}`);
  
  for (const issue of issues) {
    try {
      if (issue.pull_request) continue; // Es un PR, no un issue
  
      if (!issue.user || !issue.user.login) {
        console.warn(`[SYNC] Issue sin user válido: ${JSON.stringify(issue, null, 2)}`);
        continue;
      }
  
      const [user, userCreated] = await User.findOrCreate({
        where: { githubLogin: issue.user.login },
        defaults: { name: issue.user.login, email: '' },
      });
  
      const [issueRecord, created] = await Issue.findOrCreate({
        where: { githubId: issue.id },
        defaults: {
          userId: user.id,
          repositoryId: repo.id,
          title: issue.title,
          state: issue.state,
          createdAt: new Date(issue.created_at),
          closedAt: issue.closed_at ? new Date(issue.closed_at) : null,
        },
      });
  
      if (created) {
        console.log(`[SYNC] Issue creado: ${issue.title} by ${user.githubLogin}`);
      }
  
    } catch (err) {
      console.error(`[SYNC][ERROR] Issue fallo al sincronizar Issue ${issue.id}:`, err);
    }
  }

  //  Comments
  const comments = await getAllPages(`https://api.github.com/repos/${owner}/${name}/issues/comments`, headers);
  console.log(`[SYNC] Total Issues desde GitHub: ${comments.length}`);

  for (const comment of comments) {
    const [user] = await User.findOrCreate({
      where: { githubLogin: comment.user.login },
      defaults: { name: comment.user.login, email: '' },
    });

    const [commentRecord, created] = await Comment.findOrCreate({
      where: { githubId: comment.id },
      defaults: {
        userId: user.id,
        repositoryId: repo.id,
        body: comment.body,
        createdAt: new Date(comment.created_at),
      },
    });

    if (!created) {
      await commentRecord.update({ userId: user.id });
    }
  }
  await markProcessed(repo.id, "github");

}

async function getAllPages(url: string, headers: Record<string, string>): Promise<any[]> {
  console.log('[📡 getAllPages] URL inicial:', url);

  const results: any[] = [];
  let next: string | null = url;

  while (next) {
    const res: AxiosResponse = await axios.get(next, { headers });
    results.push(...res.data);

    const link: string | undefined = res.headers.link;
    if (link && link.includes('rel="next"')) {
      const match: RegExpMatchArray | null = link.match(/<([^>]+)>;\s*rel="next"/);
      next = match ? match[1] : null;
    } else {
      next = null;
    }
  }

  return results;
}


