import { Request, Response } from "express";
import Blog from "../models/Blog";
import { AuthRequest } from "../middleware/auth";

export const getBlogs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    console.error("Get blogs error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getMyBlogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const blogs = await Blog.find({ authorId: req.userId }).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    console.error("Get my blogs error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const updateBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) { res.status(404).json({ msg: "Blog not found" }); return; }

    // Allow owner OR admin
    if (blog.authorId.toString() !== req.userId && !req.isAdmin) {
      res.status(403).json({ msg: "Not authorized to edit this blog" });
      return;
    }

    const { title, description } = req.body;
    const file = req.file;

    if (title)       blog.title       = title;
    if (description) blog.description = description;
    if (file)        blog.image       = file.filename;

    await blog.save();
    res.json(blog);
  } catch (err) {
    console.error("Update blog error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const deleteBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) { res.status(404).json({ msg: "Blog not found" }); return; }

    // Allow owner OR admin
    if (blog.authorId.toString() !== req.userId && !req.isAdmin) {
      res.status(403).json({ msg: "Not authorized to delete this blog" });
      return;
    }
    await blog.deleteOne();
    res.json({ msg: "Blog deleted" });
  } catch (err) {
    console.error("Delete blog error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getBlogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!blog) {
      res.status(404).json({ msg: "Blog not found" });
      return;
    }

    res.json(blog);
  } catch (err) {
    console.error("Get blog error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const createBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    if (!title || !description) {
      res.status(400).json({ msg: "Title and description are required" });
      return;
    }

    const blog = await Blog.create({
      title,
      description,
      image:    file ? file.filename : "",   // empty string = use DefaultCover on frontend
      author:   req.username || "Anonymous",
      authorId: req.userId,
    });

    res.status(201).json(blog);
  } catch (err) {
    console.error("Create blog error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const likeBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!blog) {
      res.status(404).json({ msg: "Blog not found" });
      return;
    }

    res.json(blog);
  } catch (err) {
    console.error("Like blog error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
