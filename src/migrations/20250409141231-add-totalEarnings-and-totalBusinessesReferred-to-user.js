'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.addColumn('Users', 'totalEarnings', {
        type: Sequelize.DECIMAL(13,2),
        allowNull: false,
        defaultValue: 0,
      });

      await queryInterface.addColumn('Users', 'totalBusinessesReferred', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
  },

  async down (queryInterface) {
    await queryInterface.removeColumn("Users", "totalEarnings");
    await queryInterface.removeColumn("Users","totalBusinessesReferred")
  }
};
