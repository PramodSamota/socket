import express from "express";
import {
  getAllUsers,
  getUserById,
  getOnlineUsers,
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllUsers);

router.get("/online", getOnlineUsers);

router.get("/:userId", getUserById);

export default router;
