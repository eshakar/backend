import express from "express";
import { verifyToken, isAdmin } from "../middleware/auth.js";
import { getAnalytics } from "../controller/analyticsController.js";

const router = express.Router();
router.get("/", verifyToken, isAdmin, getAnalytics);

export default router;
