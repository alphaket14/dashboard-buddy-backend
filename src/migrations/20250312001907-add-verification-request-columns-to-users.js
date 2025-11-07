'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('Users');

    if (!tableDescription.verificationRequestCount) {
      await queryInterface.addColumn('Users', 'verificationRequestCount', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }

    if (!tableDescription.lastVerificationRequestTime) {
      await queryInterface.addColumn('Users', 'lastVerificationRequestTime', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('Users');

    if (tableDescription.verificationRequestCount) {
      await queryInterface.removeColumn('Users', 'verificationRequestCount');
    }

    if (tableDescription.lastVerificationRequestTime) {
      await queryInterface.removeColumn('Users', 'lastVerificationRequestTime');
    }
  }
};