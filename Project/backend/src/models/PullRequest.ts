import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

export class PullRequest extends Model {
  declare id: number;
  declare githubId: number;
  declare userId: number;
  declare repositoryId: number;
  declare title: string;
  declare state: string;
  declare createdAt: Date;
  declare closedAt: Date | null;
  declare mergedAt: Date | null;
  declare commentsCount: number;
  declare additions: number;
  declare deletions: number;
}

PullRequest.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    githubId: { type: DataTypes.BIGINT, unique: true },
    userId: DataTypes.INTEGER,
    repositoryId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    state: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    closedAt: DataTypes.DATE,
    mergedAt: DataTypes.DATE,
    commentsCount: DataTypes.INTEGER,
    additions: DataTypes.INTEGER,
    deletions: DataTypes.INTEGER,
  },
  {
    sequelize,
    tableName: 'pull_requests',
    timestamps: false,
  }
);
