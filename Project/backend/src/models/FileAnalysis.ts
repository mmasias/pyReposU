import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

export class FileAnalysis extends Model {
  declare id: number;
  declare repoId: number;
  declare filePath: string;
  declare type: 'deep' | 'express';
  declare commitHashes: string[]; // array serializado
  declare summary: string;
}

FileAnalysis.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    repoId: { type: DataTypes.INTEGER, allowNull: false },
    filePath: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM('deep', 'express'), allowNull: false },
    commitHashes: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'file_analysis',
    timestamps: true,
  }
);
