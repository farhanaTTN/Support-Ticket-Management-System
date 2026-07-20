import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { listUsers } from "../services/userService.js";

export const usersRouter = Router();

usersRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (_req, res) => {
    const users = await listUsers();
    res.json(users);
  })
);
