import { User } from './User';
import { Repository } from './Repository';
import { Commit } from './Commit';
import { CommitFile } from './CommitFile';
import { Branch } from './Branch';
import { CommitBranch } from './CommitBranch';
import { PullRequest } from './PullRequest';
import { Issue } from './Issue';
import { Comment } from './Comment';
import { CommitParent } from './CommitParent';
import { UserRepoStats } from './UserRepoStats';
import { FileAnalysis } from './FileAnalysis';
import { CommitSyncState } from './CommitSyncState';
import { BranchStats } from './BranchStats';
import { ContributionCache } from './ContributionCache';

// Relaciones

User.hasMany(Commit, { foreignKey: 'authorId' });
Commit.belongsTo(User, { foreignKey: 'authorId' });

Repository.hasMany(Commit, { foreignKey: 'repositoryId' });
Commit.belongsTo(Repository, { foreignKey: 'repositoryId' });

Commit.hasMany(CommitFile, { foreignKey: 'commitId' });
CommitFile.belongsTo(Commit, { foreignKey: 'commitId' });

Repository.hasMany(Branch, { foreignKey: 'repositoryId' });
Branch.belongsTo(Repository, { foreignKey: 'repositoryId' });

Commit.belongsToMany(Branch, {
  through: CommitBranch,
  foreignKey: 'commitId',
});
Branch.belongsToMany(Commit, {
  through: CommitBranch,
  foreignKey: 'branchId',
});

Commit.hasMany(CommitBranch, { foreignKey: 'commitId' });
CommitBranch.belongsTo(Commit, { foreignKey: 'commitId' });

User.hasMany(PullRequest, { foreignKey: 'userId' });
PullRequest.belongsTo(User, { foreignKey: 'userId' });
Repository.hasMany(PullRequest, { foreignKey: 'repositoryId' });
PullRequest.belongsTo(Repository, { foreignKey: 'repositoryId' });

User.hasMany(Issue, { foreignKey: 'userId' });
Issue.belongsTo(User, { foreignKey: 'userId' });
Repository.hasMany(Issue, { foreignKey: 'repositoryId' });
Issue.belongsTo(Repository, { foreignKey: 'repositoryId' });

User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });
Repository.hasMany(Comment, { foreignKey: 'repositoryId' });
Comment.belongsTo(Repository, { foreignKey: 'repositoryId' });

User.hasMany(UserRepoStats, { foreignKey: 'userId' });
UserRepoStats.belongsTo(User, { foreignKey: 'userId' });

Repository.hasMany(UserRepoStats, { foreignKey: 'repositoryId' });
UserRepoStats.belongsTo(Repository, { foreignKey: 'repositoryId' });

Commit.belongsToMany(Commit, {
  through: CommitParent,
  as: 'children',
  foreignKey: 'parentId',
  otherKey: 'childId',
});
Commit.belongsToMany(Commit, {
  through: CommitParent,
  as: 'parents',
  foreignKey: 'childId',
  otherKey: 'parentId',
});

CommitBranch.belongsTo(Branch, { foreignKey: 'branchId' });
CommitBranch.belongsTo(Commit, { foreignKey: 'commitId', as: 'commit' });

CommitParent.belongsTo(Commit, { foreignKey: 'parentId', as: 'parent' });
CommitParent.belongsTo(Commit, { foreignKey: 'childId', as: 'child' });

export {
  User,
  Repository,
  Commit,
  CommitFile,
  Branch,
  CommitBranch,
  PullRequest,
  Issue,
  Comment,
  UserRepoStats,
  FileAnalysis,
  CommitSyncState,
  BranchStats,
  ContributionCache,
};
