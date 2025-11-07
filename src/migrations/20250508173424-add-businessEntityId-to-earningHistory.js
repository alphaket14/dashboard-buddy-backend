'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.addColumn('EarningHistory', 'businessEntityId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references:{model:"BusinessEntities",key:"id"}
      });


 },

  async down (queryInterface, Sequelize) {
      await queryInterface.removeColumn('EarningHistory', 'businessEntityId')
 }
};
