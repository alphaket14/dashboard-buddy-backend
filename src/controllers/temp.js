const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { nanoid } = require("nanoid");

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors());

// Database Connection
const sequelize = new Sequelize("referme_db", "root", "password", {
  host: "localhost",
  dialect: "mysql",
});

// User Model
const User = sequelize.define("User", {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
});

// Business Model
const Business = sequelize.define("Business", {
  name: { type: DataTypes.STRING, allowNull: false },
  website: { type: DataTypes.STRING, allowNull: false },
});

// Referral Model
const Referral = sequelize.define("Referral", {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  businessId: { type: DataTypes.INTEGER, allowNull: false },
  referralCode: { type: DataTypes.STRING, allowNull: false, unique: true },
  clicks: { type: DataTypes.INTEGER, defaultValue: 0 },
  signups: { type: DataTypes.INTEGER, defaultValue: 0 },
});

// Define Relationships
User.hasMany(Referral, { foreignKey: "userId" });
Business.hasMany(Referral, { foreignKey: "businessId" });
Referral.belongsTo(User, { foreignKey: "userId" });
Referral.belongsTo(Business, { foreignKey: "businessId" });

// Authentication Middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, "secret");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

// Register Route
app.post("/auth/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ username, email, password: hashedPassword });
    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: "User already exists" });
  }
});

// Login Route
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id }, "secret", { expiresIn: "1h" });
  res.json({ token });
});

// Get All Businesses
app.get("/business", async (req, res) => {
  const businesses = await Business.findAll();
  res.json(businesses);
});

// Create Business
app.post("/business", async (req, res) => {
  const { name, website } = req.body;
  const business = await Business.create({ name, website });
  res.json(business);
});

// Generate Referral Link
app.post("/referral/generate", authenticate, async (req, res) => {
  const { businessId } = req.body;
  const referralCode = nanoid(10);
  const referral = await Referral.create({
    userId: req.user.id,
    businessId,
    referralCode,
  });
  res.json({ referralLink: `https://referme.app/ref/${referralCode}` });
});

// Get All Referrals for a User with Filtering
app.get("/referral/user/:userId", authenticate, async (req, res) => {
  const { status } = req.query;
  const whereCondition = { userId: req.params.userId };

  if (status === "active") {
    whereCondition.signups = { [Sequelize.Op.eq]: 0 };
  } else if (status === "completed") {
    whereCondition.signups = { [Sequelize.Op.gt]: 0 };
  }

  const referrals = await Referral.findAll({
    where: whereCondition,
    include: [Business],
  });

  res.json(referrals.map((ref) => ({
    businessId: ref.businessId,
    businessName: ref.Business.name,
    referralLink: `https://referme.app/ref/${ref.referralCode}`,
    clicks: ref.clicks,
    signups: ref.signups,
  })));
});

// Referral Click Tracking
app.get("/referral/:referralCode", async (req, res) => {
  const referral = await Referral.findOne({ where: { referralCode: req.params.referralCode } });
  if (!referral) return res.status(404).json({ message: "Referral not found" });

  await referral.update({ clicks: referral.clicks + 1 });
  res.redirect(`https://business.com/signup`);
});

// Webhook for Business Signups
app.post("/referral/webhook", async (req, res) => {
  const { referralCode } = req.body;
  const referral = await Referral.findOne({ where: { referralCode } });
  if (!referral) return res.status(404).json({ message: "Referral not found" });

  await referral.update({ signups: referral.signups + 1 });
  res.json({ message: "Referral updated" });
});

// Sync Database & Start Server
sequelize.sync().then(() => {
  app.listen(5000, () => console.log("Server running on port 5000"));
});
