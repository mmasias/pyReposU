import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

export class CommitBranch extends Model {
  declare commitId: number;
  declare branchId: number;
  declare isPrimary: boolean; //  flag
}

CommitBranch.init(
  {
    commitId: DataTypes.INTEGER,
    branchId: DataTypes.INTEGER,
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, 
    },
  },
  {
    sequelize,
    tableName: 'commit_branch',
    timestamps: false,
  }
);
