import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

export class UserRepoStats extends Model {
  declare id: number;
  declare repositoryId: number;
  declare userId: number;
  declare branch: string;
  declare startDate: Date;
  declare endDate: Date;
  declare totalContributions: number;
  declare commits: number;
  declare linesAdded: number;
  declare linesDeleted: number;
  declare pullRequests: number;
  declare issues: number;
  declare comments: number;
}

UserRepoStats.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    repositoryId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    branch: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    totalContributions: DataTypes.INTEGER,
    commits: DataTypes.INTEGER,
    linesAdded: DataTypes.INTEGER,
    linesDeleted: DataTypes.INTEGER,
    pullRequests: DataTypes.INTEGER,
    issues: DataTypes.INTEGER,
    comments: DataTypes.INTEGER,
  },
  {
    sequelize,
    tableName: 'user_repo_stats',
    timestamps: false,
  }
);
