import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

export class PullRequest extends Model {
  declare id: number;
  declare userId: number;
  declare repositoryId: number;
  declare createdAt: Date;
}

PullRequest.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: DataTypes.INTEGER,
    repositoryId: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'pull_requests',
    timestamps: false,
  }
);
