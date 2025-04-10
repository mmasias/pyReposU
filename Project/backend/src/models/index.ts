import { User } from './User';
import { Repository } from './Repository';
import { Commit } from './Commit';
import { CommitFile } from './CommitFile';
import { Branch } from './Branch';
import { CommitBranch } from './CommitBranch';
import { PullRequest } from './PullRequest';
import { Issue } from './Issue';
import { Comment } from './Comment';

// Commit → User & Repository
User.hasMany(Commit, { foreignKey: 'authorId' });
Commit.belongsTo(User, { foreignKey: 'authorId' });

Repository.hasMany(Commit, { foreignKey: 'repositoryId' });
Commit.belongsTo(Repository, { foreignKey: 'repositoryId' });

// Commit → CommitFiles
Commit.hasMany(CommitFile, { foreignKey: 'commitId' });
CommitFile.belongsTo(Commit, { foreignKey: 'commitId' });

// Repo → Branch
Repository.hasMany(Branch, { foreignKey: 'repositoryId' });
Branch.belongsTo(Repository, { foreignKey: 'repositoryId' });

// Commit ↔ Branch (M:N)
Commit.belongsToMany(Branch, {
  through: CommitBranch,
  foreignKey: 'commitId',
});
Branch.belongsToMany(Commit, {
  through: CommitBranch,
  foreignKey: 'branchId',
});

// PRs, Issues, Comments
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

// Exportamos todos
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
};
