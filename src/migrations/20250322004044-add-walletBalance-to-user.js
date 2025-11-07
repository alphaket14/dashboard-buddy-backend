'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("Users","walletBalance", {
      type:Sequelize.DECIMAL(13,2),
      allowNull:true,
      defaultValue:0.00
    })
 },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users","walletBalance");
  }
};
