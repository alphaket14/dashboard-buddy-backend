'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Referrals', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      referrerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      },
      referralCode: {
        type: Sequelize.STRING,
        allowNull: false,
        // unique: true,
      },
      businessId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Businesses', key: 'id' },
        onDelete: 'CASCADE',
      },
      referralLink: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      destinationUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      clicks: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      signups: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      refereeRegistered: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      purchaseMade: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      rewardAmount: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 2.0, // Assuming each successful referral earns 2 units
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Pending',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Referrals');
  }
};