import { DataTypes, Model, Sequelize } from "sequelize";
import { sequelize } from "../config/db"; 

export class CommitSyncState extends Model {
  declare commitId: number;
  declare type: "diff" | "stats" | "github" | "metadata";
  declare processedAt: Date;
}

CommitSyncState.init(
    {
      commitId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("diff", "stats", "github", "metadata"),
        allowNull: false,
      },
      processedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: () => new Date(),
      },
    },
    {
      sequelize,
      modelName: "CommitSyncState",
      tableName: "CommitSyncState", 
      indexes: [{ unique: true, fields: ["commitId", "type"] }],
    }
  );
  