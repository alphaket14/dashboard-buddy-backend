"use strict";
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./user.js";

const StripeAccount = sequelize.define(
  "StripeAccount",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    accountId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },
    capabilities: {
      type: DataTypes.TEXT, // Stored as JSON string
      allowNull: true,
    },
    requirementsStatus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {},
);

export default StripeAccount;
