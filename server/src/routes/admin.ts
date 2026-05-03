import { Router, Request, Response } from "express";
import User from "../models/User";
import Blog from "../models/Blog";
import authMiddleware, { adminMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// All admin routes require auth + admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/stats
router.get("/stats", async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalBlogs, blogs] = await Promise.all([
      User.countDocuments(),
      Blog.countDocuments(),
      Blog.find().sort({ createdAt: -1 }),
    ]);

    const totalViews = blogs.reduce((sum, b) => sum + (b.views || 0), 0);
    const totalLikes = blogs.reduce((sum, b) => sum + (b.likes || 0), 0);

    res.json({ totalUsers, totalBlogs, totalViews, totalLikes });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/admin/users
router.get("/users", async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/admin/blogs
router.get("/blogs", async (_req: Request, res: Response): Promise<void> => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE /api/admin/blogs/:id
router.delete("/blogs/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ msg: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Prevent admin from deleting their own account
    if (req.params.id === req.userId) {
      res.status(400).json({ msg: "You cannot delete your own admin account" });
      return;
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ msg: "User not found" });
      return;
    }

    await Blog.deleteMany({ authorId: req.params.id });
    res.json({ msg: "User and their blogs deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
