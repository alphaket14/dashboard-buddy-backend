import User from "./user.js";
import Business from "./business.js";
import Referral from "./referral.js";
import StripeAccount from "./stripeAccount.js";
import EarningHistory from "./earningHistory.js";
import BusinessEntity from "./businessEntity.js";

const setupAssociations = () => {
  User.hasMany(Referral, { foreignKey: "referrerId" });
  User.hasOne(StripeAccount, { foreignKey: "userId", as: "stripeAccount" });
  // associations can be defined here
  User.hasMany(EarningHistory, { foreignKey: "userId", as: "earnings" });
  User.hasMany(BusinessEntity, { foreignKey: "referrerId", as: "referrer" });
  Business.hasMany(Referral, { foreignKey: "businessId" });
  Business.hasMany(BusinessEntity, {
    foreignKey: "platformId",
    as: "platform",
  });
  BusinessEntity.hasMany(EarningHistory, { foreignKey: "businessEntityId" });

  Referral.belongsTo(User, { foreignKey: "referrerId" });
  Referral.belongsTo(Business, { foreignKey: "businessId" });
  EarningHistory.belongsTo(BusinessEntity, { foreignKey: "businessEntityId",as:"business" });
  StripeAccount.belongsTo(User, {
    foreignKey: "userId",
    as: "stripeAccount",
  });
  EarningHistory.belongsTo(User, {
    foreignKey: "userId",
    as: "user", // Optional: gives you a name for the association
  });
  BusinessEntity.belongsTo(User, {
    foreignKey: "referrerId",
    as: "referrer",
  });
  BusinessEntity.belongsTo(Business, {
    foreignKey: "platformId",
    as: "platform",
  });
};

export default setupAssociations;
