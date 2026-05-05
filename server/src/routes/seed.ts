import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";

const router = Router();

// POST /api/seed — creates or resets Admin account
router.post("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const hashed = await bcrypt.hash("123456789", 10);
    const existing = await User.findOne({ username: "Admin" });

    if (existing) {
      // Reset password and ensure isAdmin is true
      existing.password = hashed;
      existing.isAdmin  = true;
      await existing.save();
      res.json({ msg: "Admin password reset", username: "Admin", password: "123456789" });
      return;
    }

    await User.create({
      username: "Admin",
      email:    "admin@blogify.app",
      password: hashed,
      isAdmin:  true,
    });

    res.status(201).json({ msg: "Admin created", username: "Admin", password: "123456789" });
  } catch (err) {
    console.error("Seed error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
