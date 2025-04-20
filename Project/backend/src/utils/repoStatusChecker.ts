// src/utils/repoStatusChecker.ts
import simpleGit from 'simple-git';
import { prepareRepo } from './gitRepoUtils';
import { Commit } from '../models/Commit';
import { Repository } from '../models/Repository';

export const isRepoUpToDate = async (repoUrl: string): Promise<boolean> => {
  const localPath = await prepareRepo(repoUrl);
  const git = simpleGit(localPath);

  //  Conseguimos HEAD remoto
  const remoteHead = (await git.raw(['rev-parse', 'origin/main'])).trim();

  //  Buscamos repo en DB
  const repo = await Repository.findOne({ where: { url: repoUrl } });
  if (!repo) return false;

  //  Último commit que tenemos guardado en la DB
  const lastCommit = await Commit.findOne({
    where: { repositoryId: repo.id },
    order: [['date', 'DESC']],
  });

  if (!lastCommit) return false;

  return lastCommit.hash === remoteHead;
};
