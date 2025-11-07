'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.changeColumn("Businesses","platformFee",{
      type:Sequelize.DECIMAL(13,2),
      allowNull:false,
      defaultValue:0
    })
 },

  async down (queryInterface, Sequelize) {
    queryInterface.changeColumn("Businesses","platformFee", {
    type: Sequelize.INTEGER,
    allowNull:true,
    })
 }
};
