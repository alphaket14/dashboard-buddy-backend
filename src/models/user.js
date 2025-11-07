import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import StripeAccount from "./stripeAccount.js";
import EarningHistory from "./earningHistory.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isTermsAccepted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    verificationCode: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    referralCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    verificationRequestCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    lastVerificationRequestTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    profilePictureUrl: {
      type: DataTypes.STRING(2048),
      allowNull: true,
    },
    walletBalance: {
      type: DataTypes.DECIMAL(13, 2),
      allowNull: true,
      defaultValue: 0.0,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: true,
      defaultValue: "active",
    },
    totalEarnings: {
      type: DataTypes.DECIMAL(13,2),
      allowNull: false,
      defaultValue: 0,
    },
    totalBusinessesReferred:{
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:0
    },
    payoneerEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  },
  {
    timestamps: true,
  },
);

export default User;
