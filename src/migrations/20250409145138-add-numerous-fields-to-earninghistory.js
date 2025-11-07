"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("EarningHistory", "serviceName", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "",
    });

    await queryInterface.addColumn("EarningHistory", "businessName", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "",
    });

    await queryInterface.addColumn("EarningHistory", "customerFirstName", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "",
    });

    await queryInterface.addColumn("EarningHistory", "customerLastName", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("EarningHistory", "stripePaymentId", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn("EarningHistory", "totalFee", {
      type: Sequelize.DECIMAL(13, 2),
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn("EarningHistory", "serviceFee", {
      type: Sequelize.DECIMAL(13, 2),
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn("EarningHistory", "serviceDate", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("EarningHistory", "paymentStatus", {
      type: Sequelize.ENUM("paid", "pending", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("EarningHistory", "serviceName");
    await queryInterface.removeColumn("EarningHistory", "businessName");
    await queryInterface.removeColumn("EarningHistory", "customerFirstName");
    await queryInterface.removeColumn("EarningHistory", "customerLastName");
    await queryInterface.removeColumn("EarningHistory", "stripePaymentId");
    await queryInterface.removeColumn("EarningHistory", "totalFee");
    await queryInterface.removeColumn("EarningHistory", "serviceFee");
    await queryInterface.removeColumn("EarningHistory", "serviceDate");
    await queryInterface.removeColumn("EarningHistory", "paymentStatus");
  },
};
