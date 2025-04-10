import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

export class Comment extends Model {
  declare id: number;
  declare userId: number;
  declare repositoryId: number;
  declare createdAt: Date;
}

Comment.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: DataTypes.INTEGER,
    repositoryId: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'comments',
    timestamps: false,
  }
);
