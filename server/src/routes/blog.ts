import { Router, Request, Response, NextFunction } from "express";
import {
  getBlogs, getBlogById, createBlog, likeBlog,
  getMyBlogs, updateBlog, deleteBlog,
} from "../controllers/blogController";
import authMiddleware from "../middleware/auth";
import upload from "../middleware/upload";
import multer from "multer";

const router = Router();

// Wrap multer so upload errors return a clean JSON response.
// Image is always optional — no file is fine.
function handleUpload(req: Request, res: Response, next: NextFunction) {
  upload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ msg: `Upload error: ${err.message}` });
      return;
    }
    if (err) {
      res.status(400).json({ msg: err.message || "Invalid file" });
      return;
    }
    next();
  });
}

router.get("/",           getBlogs);
router.get("/mine",       authMiddleware, getMyBlogs);
router.get("/:id",        getBlogById);
router.post("/",          authMiddleware, handleUpload, createBlog);
router.put("/:id",        authMiddleware, handleUpload, updateBlog);
router.delete("/:id",     authMiddleware, deleteBlog);
router.post("/:id/like",  authMiddleware, likeBlog);

export default router;
