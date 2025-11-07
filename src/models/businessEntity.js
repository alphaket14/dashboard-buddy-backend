import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const BusinessEntity = sequelize.define("BusinessEntities", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  referrerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Users", key: "id" },
    onDelete: "CASCADE",
  },
  profileImageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ownerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("active", "inactive", "suspended", "pending"),
    allowNull: false,
    defaultValue: "active",
  },
  platformId: {
    type: DataTypes.INTEGER,
    references: { model: "Businesses", key: "id" },
    allowNull: false,
  },
  earnings: {
    type: DataTypes.DECIMAL(15, 2), // Allows for large amounts with 2 decimal places
    allowNull: false,
    defaultValue: 0.0,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
  },
});

export default BusinessEntity;
