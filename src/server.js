import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import businessRoutes from "./routes/bussinessRoutes.js";
import referalRoutes from "./routes/referalRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import payoutRoutes from "./routes/payoutRoutes.js";
import stripeRoutes from "./routes/stripeRoute.js";
import earningRoutes from "./routes/earningRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import businessEntityRoutes from "./routes/businessEntityRoutes.js";
import adminPanelRoutes from "./routes/adminPanelRoutes.js";

import sequelize from "./config/database.js";
import setupAssociations from "./models/associations.js";
import { swaggerUi, specs } from "./swaggerConfig.js";
import { referralEndpointHandler } from "./controllers/referralController.js";

dotenv.config();
const app = express();
setupAssociations();

// Allow all origins
// app.use(
//   cors({
//     origin: "*",
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: false
//   })
// );
app.use(
  cors({
    origin: [
      "https://referme-frontend.vercel.app",
      "https://youreferredme-development.vercel.app",
      "https://admin-panel-develop.vercel.app",
      "https://admin-panel-production.vercel.app",
      "https://www.youreferredme.com",
      "https://youreferredme.com",
      "https://www.ikonmarketplace.com/",
      "https://www.ikonmarketplace.com",
      "https://market-place-development.vercel.app",
      "https://admin-panel-orcin-phi-40.vercel.app",
      "http://localhost:3000",
      "https://www.refermellc.com",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);
// Handle preflight requests globally
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ✅ Swagger Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// ✅ Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/referrals", referalRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/payouts", payoutRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/earning", earningRoutes);
app.use("/api/businessEntity", businessEntityRoutes);
app.use("/api", contactRoutes);
app.get("/api/refer", referralEndpointHandler);
app.use("/api/adminPanel", adminPanelRoutes);

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5003;

sequelize.sync({ alter: true }).then(() => {
  console.log("Database connected and tables synced.");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// sequelize.authenticate().then(() => {
//   console.log("Database connected.");
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// }).catch((err) => {
//   console.error("Unable to connect to the database:", err);
// });
