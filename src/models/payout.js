'use strict';

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.js'; // Import the User model for associations
import EarningHistory from './earningHistory.js'; // Import the User model for associations

const Payout = sequelize.define(
  'Payout',
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: 'id' }, // Define foreign key reference
      onDelete: 'CASCADE', // Cascade delete if the referenced user is deleted
    },
    stripePayoutId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'usd',
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stripeAccountId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    earningId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: EarningHistory, key: 'id' }, 
      onDelete: 'CASCADE', 
    },
  },
  {
    timestamps: true, 
  },
);

// Define associations
User.hasMany(Payout, { foreignKey: 'userId' }); // A user can have many payouts
Payout.belongsTo(User, { foreignKey: 'userId' }); // A payout belongs to a user

export default Payout;
