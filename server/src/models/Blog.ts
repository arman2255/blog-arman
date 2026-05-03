import mongoose, { Document, Schema } from "mongoose";

export interface IBlog extends Document {
  title: string;
  description: string;
  image: string;
  author: string;
  authorId: mongoose.Types.ObjectId;
  views: number;
  likes: number;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    image: { type: String, default: "" },
    author: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IBlog>("Blog", BlogSchema);
