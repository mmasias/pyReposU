import { Model, DataTypes, BelongsToGetAssociationMixin } from 'sequelize';
import { sequelize } from '../config/db';
import { User } from './User';

export class Commit extends Model {
  declare id: number;
  declare hash: string;
  declare message: string;
  declare date: Date;
  declare authorId: number;
  declare repositoryId: number;

  declare User?: User;
}

Commit.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    hash: { type: DataTypes.STRING, allowNull: false, unique: true },
    message: DataTypes.STRING,
    date: DataTypes.DATE,
    authorId: DataTypes.INTEGER,
    repositoryId: DataTypes.INTEGER,
  },
  {
    sequelize,
    tableName: 'commits',
    timestamps: false,
  }
);
