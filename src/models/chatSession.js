import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./user.js";

const ChatSession = sequelize.define(
  "ChatSession",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    title: {
      type: DataTypes.STRING(200),
      defaultValue: "New Chat",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    indexes: [{ fields: ["user_id"] }, { fields: ["user_id", "createdAt"] }],
  }
);

// Define relationships
ChatSession.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

User.hasMany(ChatSession, {
  foreignKey: "user_id",
  as: "chat_sessions",
});

export default ChatSession;
