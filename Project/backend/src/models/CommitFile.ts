import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

export class CommitFile extends Model {
  declare id: number;
  declare commitId: number;
  declare filePath: string;
  declare linesAdded: number;
  declare linesDeleted: number;
  declare diff: string;
}

CommitFile.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    commitId: DataTypes.INTEGER,
    filePath: DataTypes.STRING,
    linesAdded: DataTypes.INTEGER,
    linesDeleted: DataTypes.INTEGER,
    diff: DataTypes.TEXT,
  },
  {
    sequelize,
    tableName: 'commit_files',
    timestamps: false,
  }
);
