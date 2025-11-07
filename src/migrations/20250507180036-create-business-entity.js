"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("BusinessEntities", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      profileImageUrl: {
        type: Sequelize.STRING,
        allowNull:true
      },
      ownerName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      referrerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onDelete: "CASCADE",
      },
      description: {
        type: Sequelize.STRING,
        defaultValue: "",
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive", "suspended", "pending"),
        allowNull: false,
        defaultValue: "active",
      },
      platform: {
        type: Sequelize.INTEGER,
        references: { model: "Businesses", key: "id" },
        allowNull: false,
      },
      earnings: {
        type: Sequelize.DECIMAL(15, 2), // Allows for large amounts with 2 decimal places
        allowNull: false,
        defaultValue: 0.0,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
        ),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Add index for frequently queried fields
    await queryInterface.addIndex("BusinessEntities", ["status"]);
    await queryInterface.addIndex("BusinessEntities", ["platform"]);
    await queryInterface.addIndex("BusinessEntities", ["owner_name"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("BusinessEntities");
  },
};
