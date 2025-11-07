'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("Users","status", {
      type:Sequelize.ENUM("active","inactive"),
      allowNull:true,
      defaultValue:"active"
    })
 },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users","status");
  }
};
