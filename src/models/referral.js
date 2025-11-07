import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.js';
import Business from './business.js';

const Referral = sequelize.define('Referrals', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  referrerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' },
    onDelete: 'CASCADE',
  },
  referralCode: {
    type: DataTypes.STRING,
    allowNull: false,
    // unique: true,
  },
  businessId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Business, key: 'id' },
    onDelete: 'CASCADE',
  },
  referralLink: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  destinationUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  clicks: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  signups: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  refereeRegistered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  purchaseMade: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  rewardAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 2.0,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Pending',
  },
}, {
  timestamps: true,
});

User.hasMany(Referral, { foreignKey: 'referrerId' });
Business.hasMany(Referral, { foreignKey: 'businessId' ,as: 'business'});
Referral.belongsTo(User, { foreignKey: 'referrerId' });
Referral.belongsTo(Business, { foreignKey: 'businessId',as: 'business' });

export default Referral;
