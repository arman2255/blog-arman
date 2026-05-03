"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DefaultCover from "./DefaultCover";

interface Props {
  blog: any;
  onLike?: (id: string) => void;
}

const ACCENTS = [
  "linear-gradient(135deg,#4f35d2,#8b74f0)",
  "linear-gradient(135deg,#f05a4f,#f59e0b)",
  "linear-gradient(135deg,#0d9488,#4f35d2)",
  "linear-gradient(135deg,#f59e0b,#f05a4f)",
  "linear-gradient(135deg,#6b52e8,#0d9488)",
  "linear-gradient(135deg,#f05a4f,#6b52e8)",
];

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

export default function BlogCard({ blog }: Props) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const accentIdx = parseInt(blog._id?.slice(-1) || "0", 16) % ACCENTS.length;
  const accent = ACCENTS[accentIdx];

  const handleClick = () => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
    } else {
      router.push(`/blog/${blog._id}`);
    }
  };

  const showDefault = !blog.image || imgError;

  return (
    <article
      onClick={handleClick}
      className="group cursor-pointer"
      style={{
        background: "var(--surface)",
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid var(--border)",
        boxShadow: "0 2px 12px rgba(79,53,210,0.06)",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        display: "flex", flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-5px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(79,53,210,0.16)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(79,53,210,0.06)";
      }}
    >
      {/* Cover */}
      <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", background: "var(--bg-3)" }}>
        {showDefault ? (
          <DefaultCover title={blog.title} accentIndex={accentIdx} height="100%" />
        ) : (
          <img
            src={`${API_BASE}/uploads/${blog.image}`}
            alt={blog.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.45s ease" }}
            className="group-hover:scale-[1.06]"
            onError={() => setImgError(true)}
          />
        )}

        {/* Accent bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: accent }} />

        {/* Read overlay */}
        <div
          style={{
            position: "absolute", inset: 0,
            background: "rgba(79,53,210,0)",
            transition: "background 0.3s",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          className="group-hover:bg-indigo-900/20"
        >
          <span
            style={{
              background: "rgba(255,255,255,0.93)", color: "var(--indigo)",
              fontSize: 12, fontWeight: 700, padding: "5px 16px", borderRadius: 20,
              opacity: 0, transition: "opacity 0.25s", letterSpacing: "0.06em",
            }}
            className="group-hover:opacity-100"
          >
            Read →
          </span>
        </div>
      </div>

      {/* Text */}
      <div style={{ padding: "14px 16px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
        <h2
          style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", lineHeight: 1.4, transition: "color 0.2s" }}
          className="group-hover:text-[var(--indigo)]"
        >
          {blog.title}
        </h2>
        <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: "auto" }}>
          @{blog.author}
        </p>
      </div>
    </article>
  );
}
