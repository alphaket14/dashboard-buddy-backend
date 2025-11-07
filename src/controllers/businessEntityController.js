import { Op } from "sequelize";
import Business from "../models/business.js";
import BusinessEntity from "../models/businessEntity.js";
import EarningHistory from "../models/earningHistory.js";

export async function searchBusinessEntities(req, res) {
  const userId = req.user.id;
  const searchTerm = req.query.q; // Search query parameter
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  if (!searchTerm || searchTerm.trim() === "") {
    return res.status(400).json({ message: "Search term is required" });
  }

  try {
    const { count, rows: entities } = await BusinessEntity.findAndCountAll({
      where: {
        referrerId: userId,
        [Op.or]: [
          { name: { [Op.like]: `%${searchTerm}%` } },
          { ownerName: { [Op.like]: `%${searchTerm}%` } },
        ],
      },
      offset,
      limit,
      include: [
        {
          model: Business,
          as: "platform",
          attributes: ["name"],
        },
      ],
      order: [["createdAt", "DESC"]], // Optional: sort by newest first
    });
    res.json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      businessEntities: entities,
      searchTerm: searchTerm,
    });
  } catch (error) {
    console.log("[SEARCH BUSINESS ENTITY ERROR]: ", error);
    res.status(500).json({ message: error.message });
  }
}

export async function getTopEarningEntities(req, res) {
  const userId = req.user.id;

  try {
    const topEntities = await BusinessEntity.findAll({
      where: { referrerId: userId },
      order: [["earnings", "DESC"]], // Order by earnings in descending order
      limit: 3, // Get only top 3
      include: [
        {
          model: Business,
          as: "platform",
          attributes: ["name"],
        },
      ],
    });

    res.json({
      topEarningEntities: topEntities,
    });
  } catch (error) {
    console.log("[TOP EARNING ENTITIES ERROR]: ", error);
    res.status(500).json({ message: error.message });
  }
}

export async function getBusinessEntities(req, res) {
  const userId = req.user.id;
  // Pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const { count, rows: entities } = await BusinessEntity.findAndCountAll({
      where: { referrerId: userId },
      offset,
      limit,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Business,
          as: "platform",
          attributes: ["name"],
        },
      ],
    });
    res.json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      businessEntities: entities,
    });
  } catch (error) {
    console.log("[BUSINESS ENTITY ERROR]: ", error);
    res.status(500).json({ message: error.message });
  }
}

export async function getBusinessEntityHistory(req, res) {
  const entityId = req.params.id;
  const userId = req.user.id;
  // Pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const entity = await BusinessEntity.findByPk(entityId);

    if (!entity) throw new Error("Business Entity with this ID does not exist");
    if (entity.referrerId !== userId)
      throw new Error("Business not referred by this user");

    const { count, rows: earningHistory } =
      await EarningHistory.findAndCountAll({
        where: { businessEntityId: entityId },
        offset,
        limit,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: BusinessEntity,
            as: "business",
            attributes: ["name", "ownerName", "profileImageUrl"],
          },
        ],
      });
    const totalEarning = earningHistory.reduce((sum, item) => {
      return sum + parseFloat(item.dataValues.amount || 0);
    }, 0);
    console.log("earningHistory......", earningHistory);

    res.json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      earningHistory,
      totalEarning,
      businessDetails: entity,
    });
  } catch (error) {
    console.log("[BUSINESS ENTITY ERROR]: ", error);
    res.status(500).json({ message: error.message });
  }
}
