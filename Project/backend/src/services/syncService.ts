import { Repository as RepositoryModel } from "../models/Repository";
import { User } from "../models/User";
import { Commit } from "../models/Commit";
import { CommitFile } from "../models/CommitFile";
import { Branch } from "../models/Branch";
import { CommitBranch } from "../models/CommitBranch";
import { CommitParent } from "../models/CommitParent";
import { PullRequest } from '../models/PullRequest';
import axios, { AxiosResponse } from 'axios';
import { Repository } from '../models/Repository';
import { Issue } from '../models/Issue';
import { Comment } from "../models";
import {getLastLocalCommitHash, getLatestRemoteCommitHash, getFileContent, fileExistsInCommit} from '../utils/gitRepoUtils';
import { generateFileDiff } from "../utils/diffUtils";
import { SyncOptions } from "../types/syncOptions";
import { CommitSyncState } from "../models/CommitSyncState";
import { wasProcessed, markProcessed } from "../services/syncState";
import { Branch as BranchModel } from "../models/Branch";
import { getCurrentFilesFromBranch } from '../utils/gitRepoUtils';

import {
  prepareRepo,
  getCommits,
  getCommitBranches,
  getCommitDiffStats,
  detectRenames, 
} from "../utils/gitRepoUtils";
import { isRepoUpToDate } from "../utils/repoStatusChecker";
import { normalizePath } from "../utils/file.utils";
import simpleGit from "simple-git";

//registro de repos en proceso de sincronizacion
const syncingRepos = new Set<string>();
const syncingRepoPromises: Map<string, Promise<void>> = new Map();

export const syncRepoIfNeeded = async (
  repoUrl: string,
  options: SyncOptions = {}
): Promise<void> => {
  if (syncingRepoPromises.has(repoUrl)) {
    console.log(`[SYNC] Esperando a que termine la sincronización en curso para ${repoUrl}... ⏳`);
    return await syncingRepoPromises.get(repoUrl);
  }

  const syncPromise = (async () => {
    syncingRepos.add(repoUrl);
    try {
      const {
        syncCommits: shouldSyncCommits = true,
        syncDiffs = true,
        syncStats = true,
        syncGithubActivityOption = true,
        lightSync = false,
        forceSyncNow: forceImmediateSync = false
      } = options;

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

      const branch = "main";
      const localHash = await getLastLocalCommitHash(repoUrl, branch);
      const remoteHash = await getLatestRemoteCommitHash(localPath, branch);

      const lastCommit = await Commit.findOne({
        where: { hash: localHash, repositoryId: repo.id },
      });

      const hasFiles =
      lastCommit &&
      (await CommitFile.count({ where: { commitId: lastCommit.id } })) > 0;
    
    const statsDone =
      lastCommit &&
      (await wasProcessed(lastCommit.id, "stats"));
    
    const alreadySynced = lastCommit && hasFiles && statsDone;
    
    if (
      forceImmediateSync ||
      (shouldSyncCommits && !alreadySynced)
    ) {
      console.log(`[SYNC] 🧠 Ejecutando syncCommits (análisis completo)...`);
      await syncCommits(repo, localPath, {
        syncDiffs: forceImmediateSync ? true : syncDiffs,
        syncStats: forceImmediateSync ? true : syncStats,
      });
    } else {
      console.log(`[SYNC] ✅ Último commit ya sincronizado con archivos y stats (${branch})`);
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

export const syncCommits = async (
  repo: Repository,
  localPath: string,
  options: { syncDiffs?: boolean; syncStats?: boolean } = {}
): Promise<void> => {
  const { syncDiffs = true, syncStats = true } = options;

  const git = simpleGit(localPath);
  const rawCommits = await getCommits(localPath);
  for (const raw of rawCommits) {
    const [user] = await User.findOrCreate({
      where: { githubLogin: raw.author },
      defaults: { name: raw.author, email: "" },
    });

    const [newCommit, created] = await Commit.findOrCreate({
      where: { hash: raw.hash },
      defaults: {
        message: raw.message,
        date: new Date(raw.date),
        authorId: user.id,
        repositoryId: repo.id,
      },
    });

    if (!created && !syncDiffs && !syncStats) {
      continue;
    }

    let normalizedDiffStats: Record<string, { added: number; deleted: number }> = {};

    if (syncStats && raw.hash) {
      const alreadyProcessed = await wasProcessed(newCommit.id, "stats");
    
      if (!alreadyProcessed) {
        try {
          const rawStats = await getCommitDiffStats(localPath, raw.hash);
          console.log(`[DEBUG] rawStats recibidas:`, rawStats);
          //console.log(`[SYNC][${raw.hash}] Diff stats obtenidas:`, rawStats);

    
          console.log(`[SYNC][${raw.hash}] 🔍 Stats brutas recibidas:`);
          for (const [path, value] of Object.entries(rawStats)) {
            const normalized = normalizePath(path);
            console.log(`   - Original: "${path}" → Normalizado: "${normalized}" | +${value.added} / -${value.deleted}`);
            normalizedDiffStats[normalized] = value;
          }
    
          await markProcessed(newCommit.id, "stats");
        } catch (e) {
          console.warn(`[SYNC] ❌ No se pudieron obtener stats para ${raw.hash}`, e);
        }
      } else {
        console.log(`[SYNC][${raw.hash}] Stats ya estaban procesadas ✔️`);
      }
    }
    
    
/*
    if (syncDiffs && !(await wasProcessed(newCommit.id, "diff")) && raw.parents?.[0]) {
      const previousCommit = raw.parents[0];
      const unifiedPath = normalizePath(""); // Initialize unifiedPath appropriately
      const existsInPrev = await fileExistsInCommit(localPath, previousCommit, unifiedPath);
      const existsInCurr = await fileExistsInCommit(localPath, raw.hash, unifiedPath);
      let diffContent = ""; // Declare diffContent before using it
    
      if (existsInPrev && existsInCurr) {
        const prevContent = await getFileContent(repo.url, previousCommit, unifiedPath);
        const currContent = await getFileContent(repo.url, raw.hash, unifiedPath);
        diffContent = generateFileDiff(prevContent, currContent);
      }
    }*/
    
    if (syncDiffs && !(await wasProcessed(newCommit.id, "diff"))) {
      await markProcessed(newCommit.id, "diff");
    }
    
    console.log(`[DEBUG] Archivos modificados en ${raw.hash}:`, raw.files);
    console.log(`[DEBUG] Claves en normalizedDiffStats:`, Object.keys(normalizedDiffStats));
    
    for (let rawPath of raw.files) {
      //console.log('[DEBUG] Comparando rutas:');
      //      console.log('normalizedPath:', normalizePath(rawPath));
      //console.log('stats disponibles:', Object.keys(normalizedDiffStats));
      let filePath = normalizePath(rawPath)
        .replace(/\{.*=>\s*(.*?)\}/, "$1")
        .replace(/^"(.*)"$/, "$1")
        .replace(/^Project\//, "");

      const originalPath = await detectRenames(git, filePath);
      const unifiedPath = normalizePath(originalPath);

      // Encuentra una key similar dentro de normalizedDiffStats
      let statsKey = Object.keys(normalizedDiffStats).find(
        k => k === filePath || k.endsWith(filePath)
      );

      const stats = statsKey ? normalizedDiffStats[statsKey] : { added: 0, deleted: 0 };

      console.log(`[MATCH] filePath usado: ${filePath} - Clave encontrada: ${statsKey} | +${stats.added} / -${stats.deleted}`);
      let diffContent = "";

      if (syncDiffs && raw.parents?.[0]) {
        const previousCommit = raw.parents[0];
        const existsInPrev = await fileExistsInCommit(localPath, previousCommit, unifiedPath);
        const existsInCurr = await fileExistsInCommit(localPath, raw.hash, unifiedPath);

        if (existsInPrev && existsInCurr) {
          const prevContent = await getFileContent(repo.url, previousCommit, unifiedPath);
          const currContent = await getFileContent(repo.url, raw.hash, unifiedPath);
          diffContent = generateFileDiff(prevContent, currContent);
        }
      }

      await CommitFile.findOrCreate({
        where: { commitId: newCommit.id, filePath: unifiedPath },
        defaults: {
          linesAdded: stats?.added ?? 0,
          linesDeleted: stats?.deleted ?? 0,
          diff: diffContent || "", // aunque esté vacío, lo guardamos
        },
      });

      console.log(`[DB] CommitFile creado para ${unifiedPath}: +${stats?.added} / -${stats?.deleted}`);
      
    }

    const branches = await getCommitBranches(localPath, raw.hash);
    const cleanBranches = branches.map(b => b.replace(/^origin\//, "").trim());

    const allBranches = await Branch.findAll({ where: { repositoryId: repo.id } });
    const branchMap = new Map(allBranches.map(b => [b.name, b.id]));

    for (const branchName of cleanBranches) {
      let branchId = branchMap.get(branchName);
    
      if (!branchId) {
        const branch = await Branch.create({
          name: branchName,
          repositoryId: repo.id,
        });
        branchId = branch.id;
        branchMap.set(branchName, branchId);
      }
    
      await CommitBranch.findOrCreate({
        where: { commitId: newCommit.id, branchId },
        defaults: { isPrimary: false },
      });
    }
    

    try {
      const nameRevOutput = await git.raw(["name-rev", "--name-only", raw.hash]);
      const matchedBranch = nameRevOutput.split("~")[0].trim();

      const primaryBranch = await Branch.findOne({
        where: { name: matchedBranch, repositoryId: repo.id },
      });

      if (primaryBranch) {
        await CommitBranch.update(
          { isPrimary: true },
          { where: { commitId: newCommit.id, branchId: primaryBranch.id } }
        );
      }
    } catch (err) {
      console.warn(`[SYNC][WARN] No se pudo determinar primaryBranch para ${raw.hash}`);
    }

    for (const parentHash of raw.parents || []) {
      const parentCommit = await Commit.findOne({ where: { hash: parentHash } });

      if (parentCommit) {
        await CommitParent.findOrCreate({
          where: {
            parentId: parentCommit.id,
            childId: newCommit.id,
          },
        });
      }
    }
  }
  const remoteBranches = await git.branch(['-r']);
  const existingBranches = await Branch.findAll({ where: { repositoryId: repo.id } });
  const existingNames = new Set(existingBranches.map(b => b.name));
  
  for (const remoteBranch of Object.keys(remoteBranches.branches)) {
    const cleanName = remoteBranch.replace(/^origin\//, "").trim();
    if (!existingNames.has(cleanName)) {
      await Branch.create({ name: cleanName, repositoryId: repo.id });
      console.log(`[SYNC] Rama añadida manualmente: ${cleanName}`);
    }
  }
  
  await RepositoryModel.update({ primaryBranch: "main" }, { where: { id: repo.id } });
  
  console.log(`[SYNC] Commits y ramas sincronizadas correctamente ✅`);
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


