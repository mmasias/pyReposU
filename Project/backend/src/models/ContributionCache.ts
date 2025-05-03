import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

export class ContributionCache extends Model {
  public branchId!: number;
  public data!: string;
}

ContributionCache.init(
  {
    branchId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    data: {
      type: DataTypes.TEXT('long'), // admite JSON grande
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'ContributionCache',
    modelName: 'ContributionCache',
    timestamps: true,
  }
);
