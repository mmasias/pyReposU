import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

export class User extends Model {
  declare id: number;
  declare githubLogin: string;
  declare name: string;
  declare email: string;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    githubLogin: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: false,
  }
);
