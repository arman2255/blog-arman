import path from "path";
import express from "express";
import cors from "cors";
import connectDB from "./config/db";
import authRoutes from "./routes/auth";
import blogRoutes from "./routes/blog";
import seedRoutes from "./routes/seed";
import adminRoutes from "./routes/admin";

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/seed", seedRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
