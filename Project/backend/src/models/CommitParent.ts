import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db';

export class CommitParent extends Model {
  declare parentId: number;
  declare childId: number;
}

CommitParent.init(
  {
    parentId: DataTypes.INTEGER,
    childId: DataTypes.INTEGER,
  },
  {
    sequelize,
    tableName: 'commit_parents',
    timestamps: false,
  }
);
