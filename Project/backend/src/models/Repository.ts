import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

export class Repository extends Model {
  declare id: number;
  declare url: string;
  declare name: string;
  declare owner: string;
}

Repository.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    url: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: DataTypes.STRING,
    owner: DataTypes.STRING,
  },
  {
    sequelize,
    tableName: 'repositories',
    timestamps: false,
  }
);
