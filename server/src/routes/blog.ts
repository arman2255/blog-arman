import { Router, Request, Response, NextFunction } from "express";
import { getBlogs, getBlogById, createBlog, likeBlog } from "../controllers/blogController";
import authMiddleware from "../middleware/auth";
import upload from "../middleware/upload";
import multer from "multer";

const router = Router();

// Wrap multer so upload errors (wrong file type, size limit) return a clean JSON response
// instead of crashing the request. Image is always optional — no file is fine.
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

router.get("/", getBlogs);
router.get("/:id", getBlogById);
router.post("/", authMiddleware, handleUpload, createBlog);
router.post("/:id/like", authMiddleware, likeBlog);

export default router;
