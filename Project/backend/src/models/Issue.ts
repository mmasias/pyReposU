import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

export class Issue extends Model {
  declare id: number;
  declare userId: number;
  declare repositoryId: number;
  declare createdAt: Date;
}

Issue.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: DataTypes.INTEGER,
    repositoryId: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'issues',
    timestamps: false,
  }
);
