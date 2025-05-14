import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db';
import { Branch } from './Branch';

export class BranchStats extends Model {
  public id!: number;
  public branchId!: number;
  public lastCommitHash!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

BranchStats.init(
  {
    branchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // una entrada por rama
    },
    lastCommitHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'branch_stats',
    modelName: 'BranchStats',
    timestamps: true,
  }
);

// Asociación (1:1 con Branch)
BranchStats.belongsTo(Branch, { foreignKey: 'branchId' });
Branch.hasOne(BranchStats, { foreignKey: 'branchId' });
