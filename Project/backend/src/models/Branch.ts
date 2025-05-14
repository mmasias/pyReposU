import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

export class Branch extends Model {
  declare id: number;
  declare name: string;
  declare repositoryId: number;
}

Branch.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: DataTypes.STRING,
    repositoryId: DataTypes.INTEGER,
  },
  {
    sequelize,
    tableName: 'branches',
    timestamps: false,
  }
);
