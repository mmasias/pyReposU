import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';
import { Commit } from './Commit';

export class CommitFile extends Model {
  declare id: number;
  declare commitId: number;
  declare filePath: string;
  declare linesAdded: number;
  declare linesDeleted: number;
  declare diff: string;
  declare content?: string; 

  declare Commit?: Commit;
}

CommitFile.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    commitId: { type: DataTypes.INTEGER, allowNull: false },
    filePath: { type: DataTypes.STRING, allowNull: false },
    linesAdded: { type: DataTypes.INTEGER, allowNull: true },
    linesDeleted: { type: DataTypes.INTEGER, allowNull: true },
    diff: { type: DataTypes.TEXT, allowNull: true },
    content: { type: DataTypes.TEXT, allowNull: true }, 
  },
  {
    sequelize,
    tableName: 'commit_files',
    timestamps: false,
  }
);
