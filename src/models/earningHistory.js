import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../config/database.js";
import User from "./user.js";

const EarningHistory = sequelize.define(
  "EarningHistory",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    businessEntityId: {
      type: DataTypes.INTEGER,
      references: { model: "BusinessEntities", key: "id" },
      allowNull: true,
    },
    // commission
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      // Types: 'referral', 'withdrawal', 'refund', etc.
    },
    reference: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // New fields below
    serviceName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    customerFirstName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    customerLastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripePaymentId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payoneerEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentAvailableOn: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    totalFee: {
      type: DataTypes.DECIMAL(13, 2),
      allowNull: false,
      defaultValue: 0,
    },
    serviceFee: {
      type: DataTypes.DECIMAL(13, 2),
      allowNull: false,
      defaultValue: 0,
    },
    serviceDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    paymentStatus: {
      type: DataTypes.ENUM("paid", "pending", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    transactionType: {
      type: DataTypes.ENUM("regular", "qr"),
      allowNull: false,
      defaultValue: "regular",
    }
  },
  {
    // Model options
    timestamps: true, // Adds createdAt and updatedAt automatically
  },
);

export default EarningHistory;
