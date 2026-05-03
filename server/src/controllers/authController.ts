import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";

const generateToken = (id: string, username: string, isAdmin = false): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return jwt.sign({ id, username, isAdmin }, secret, { expiresIn: "7d" });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ msg: "Username, email and password are required" });
      return;
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      res.status(400).json({ msg: "Email already in use" });
      return;
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      res.status(400).json({ msg: "Username already taken" });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });

    const token = generateToken(user._id.toString(), user.username);
    res.status(201).json({ token, username: user.username, isAdmin: false });
  } catch (err: any) {
    // Handle MongoDB duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];
      if (field === "email")    { res.status(400).json({ msg: "Email already in use" }); return; }
      if (field === "username") { res.status(400).json({ msg: "Username already taken" }); return; }
      res.status(400).json({ msg: "Account already exists" });
      return;
    }
    console.error("Register error:", err);
    res.status(500).json({ 
      msg: "Server error",
      detail: process.env.NODE_ENV !== "production" ? String(err?.message || err) : undefined
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ msg: "Username and password are required" });
      return;
    }

    // Allow login with either username or email
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!user) {
      res.status(401).json({ msg: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ msg: "Invalid credentials" });
      return;
    }

    const token = generateToken(user._id.toString(), user.username, user.isAdmin);
    res.json({ token, username: user.username, isAdmin: user.isAdmin });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
