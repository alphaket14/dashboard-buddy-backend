export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("Users", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    firstName: { type: Sequelize.STRING, allowNull: false },
    lastName: { type: Sequelize.STRING, allowNull: false },
    email: { type: Sequelize.STRING, allowNull: false },
    password: { type: Sequelize.STRING, allowNull: false },
    isEmailVerified: { type: Sequelize.BOOLEAN, defaultValue: false },
    referralCode: { type: Sequelize.STRING },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
  });

// Add unique constraints explicitly
  await queryInterface.addConstraint("Users", {
    fields: ["email"],
    type: "unique",
    name: "users_email_unique"
  });

  await queryInterface.addConstraint("Users", {
    fields: ["referralCode"],
    type: "unique",
    name: "users_referral_code_unique"
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("Users");
}
