import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

export class Comment extends Model {
  declare id: number;
  declare githubId: number;
  declare userId: number;
  declare repositoryId: number;
  declare body: string;
  declare createdAt: Date;
}

Comment.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    githubId: { type: DataTypes.BIGINT, unique: true }, 
    userId: DataTypes.INTEGER,
    repositoryId: DataTypes.INTEGER,
    body: DataTypes.TEXT,
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'comments',
    timestamps: false,
  }
);
