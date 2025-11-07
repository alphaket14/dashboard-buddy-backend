import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getBusinessEntities,
  getBusinessEntityHistory,
  getTopEarningEntities,
  searchBusinessEntities,
} from "../controllers/businessEntityController.js";

const router = express.Router();

router.get("/", protect, getBusinessEntities);
router.get("/:id/history", protect, getBusinessEntityHistory);
router.get("/search", protect, searchBusinessEntities);
router.get("/top", protect, getTopEarningEntities);

export default router;
