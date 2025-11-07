import { Op, Sequelize } from "sequelize";
import EarningHistory from "../models/earningHistory.js";
import User from "../models/user.js";
import BusinessEntity from "../models/businessEntity.js";

export async function getAllEarningHistory(req, res) {
  // Pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const { count, rows: history } = await EarningHistory.findAndCountAll({
      offset,
      limit,
      order: [["createdAt", "DESC"]], // Optional: sort by newest first
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      history,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.log("[EARNING HISTORY]: ", error);
    res.status(500).json({ message: error.message });
  }
}

export async function getAllEarningHistoryWithYearData(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    // Get paginated results
    const { count, rows: allTransactions } =
      await EarningHistory.findAndCountAll({
        offset,
        limit,
        order: [["createdAt", "DESC"]], // Optional: sort by newest first
        include: [
          {
            model: User,
            attributes: ["id", "firstName", "lastName"],
            as: "user",
          },
        ],
      });

    // Calculate total pages
    const totalPages = Math.ceil(count / limit);

    // Calculate total earnings from ALL entries (not just paginated ones)
    const totalBpmEarningsResult = await EarningHistory.findAll({
      attributes: [[Sequelize.fn("SUM", Sequelize.col("amount")), "total"]],
      raw: true,
    });

    const totalBpmEarnings = parseFloat(totalBpmEarningsResult[0].total || 0);

    // Calculate current year's monthly earnings
    const currentYearEarnings = await calculateCurrentYearMonthlyEarnings();

    res.json({
      allTransactions,
      totalBpmEarnings: totalBpmEarnings.toFixed(2), // Convert to string with 2 decimal places
      currentYearEarnings,
      pagination: {
        total: count,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.log("[EARNING HISTORY]: ", error);
    res.status(500).json({ message: error.message });
  }
}

async function calculateCurrentYearMonthlyEarnings() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const firstDayOfYear = new Date(currentYear, 0, 1); // January 1st of current year

  // Initialize result object with all months set to "0.00"
  const result = {};
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  monthNames.forEach((month) => {
    result[month] = "0.00";
  });

  try {
    // Query database for earnings in the current year grouped by month
    const monthlyEarnings = await EarningHistory.findAll({
      attributes: [
        [Sequelize.fn("MONTH", Sequelize.col("createdAt")), "month"],
        [Sequelize.fn("SUM", Sequelize.col("amount")), "total"],
      ],
      where: {
        createdAt: {
          [Op.gte]: firstDayOfYear,
          [Op.lte]: now,
        },
      },
      group: [Sequelize.fn("MONTH", Sequelize.col("createdAt"))],
      raw: true,
    });

    // Update the result object with actual values
    monthlyEarnings.forEach((item) => {
      const monthIndex = item.month - 1; // MONTH returns 1-12, we need 0-11
      const monthName = monthNames[monthIndex];
      // Convert to string with 2 decimal places
      result[monthName] = parseFloat(item.total).toFixed(2);
    });

    return result;
  } catch (error) {
    console.error("Error calculating monthly earnings:", error);
    return result; // Return the initialized object with all zeros if there's an error
  }
}

export async function getEarningHistoryByUserId(req, res) {
  const userId = req.user.id;
  if (!userId) return res.status(400).json({ message: "User Id required" });

  // Pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const { count, rows: history } = await EarningHistory.findAndCountAll({
      where: { userId, paymentStatus: "paid" },
      offset,
      limit,
      order: [["createdAt", "DESC"]], // Optional: sort by newest first
      include: [
        {
          model: BusinessEntity,
          as: "business",
          attributes: ["name", "ownerName", "profileImageUrl"],
        },
      ],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      history,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.log("[EARNING HISTORY]: ", error);
    res.status(500).json({ message: error.message });
  }
}

export async function getEarningHistoryById(req, res) {
  const earningHistoryId = req.params.id;

  try {
    if (!earningHistoryId) throw new Error("Id required");
    const earningHistory = await EarningHistory.findByPk(earningHistoryId, {
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName"],
          as: "user",
        },
      ],
    });

    return res.json({ earningHistory });
  } catch (error) {
    console.log("[EARNING HISTORY]: ", error);
    res.status(500).json({ message: error.message });
  }
}
