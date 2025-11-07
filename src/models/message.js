import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import ChatSession from "./chatSession.js";

const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    session_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "ChatSessions",
        key: "id",
      },
    },
    role: {
      type: DataTypes.ENUM("user", "assistant", "system"),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    token_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    answered_from_faq: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_unknown_question: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true, // This gives you createdAt and updatedAt
    indexes: [
      { fields: ["session_id"] },
      { fields: ["role"] },
      { fields: ["is_unknown_question"] },
      { fields: ["createdAt"] }, // For timestamp queries
    ],
  }
);

// Define relationships
Message.belongsTo(ChatSession, {
  foreignKey: "session_id",
  as: "session",
});

ChatSession.hasMany(Message, {
  foreignKey: "session_id",
  as: "messages",
});

export default Message;
