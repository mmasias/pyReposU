import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

export class CommitBranch extends Model {
  declare commitId: number;
  declare branchId: number;
}

CommitBranch.init(
  {
    commitId: DataTypes.INTEGER,
    branchId: DataTypes.INTEGER,
  },
  {
    sequelize,
    tableName: 'commit_branch',
    timestamps: false,
  }
);
