import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";

const router = Router();

// POST /api/seed — creates Admin account once, then this route should be removed
router.post("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const existing = await User.findOne({ username: "Admin" });
    if (existing) {
      if (!existing.isAdmin) {
        existing.isAdmin = true;
        await existing.save();
      }
      res.json({ msg: "Admin account already exists", username: "Admin" });
      return;
    }

    const hashed = await bcrypt.hash("123456789", 10);
    await User.create({
      username: "Admin",
      email: "admin@blogify.app",
      password: hashed,
      isAdmin: true,
    });

    res.status(201).json({ msg: "Admin created", username: "Admin", password: "123456789" });
  } catch (err) {
    console.error("Seed error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
