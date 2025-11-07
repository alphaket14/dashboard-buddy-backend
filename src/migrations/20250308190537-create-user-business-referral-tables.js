'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        // unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isTermsAccepted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      verificationCode: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      referralCode: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.createTable('Businesses', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      logoUrl: {
        type: Sequelize.STRING(2048),
        allowNull: true,
      },
      url: {
        type: Sequelize.STRING,
        allowNull: true,
       
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.createTable('Referrals', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
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
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Referrals');
    await queryInterface.dropTable('Businesses');
    await queryInterface.dropTable('Users');
  },
};