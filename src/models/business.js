import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Business = sequelize.define(
  "Businesses",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    logoUrl: {
      type: DataTypes.STRING(2048),
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    platformFee: {
      type: DataTypes.DECIMAL(13, 2),
      allowNull: true,
    },
    feeType: {
      type: DataTypes.ENUM("fixed", "percentage"),
      allowNull: true,
    },
    imIkonPlatformId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

export default Business;
