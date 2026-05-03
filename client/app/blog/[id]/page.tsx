"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { API } from "@/services/api";
import DefaultCover from "@/components/DefaultCover";

export default function BlogDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [blog, setBlog]         = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [liked, setLiked]       = useState(false);
  const [imgError, setImgError] = useState(false);
  const viewCounted = useRef(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) router.replace("/login");
  }, [router]);

  useEffect(() => {
    if (!id || viewCounted.current) return;
    viewCounted.current = true;
    API.get(`/blogs/${id}`)
      .then((r) => setBlog(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (liked) return;
    try {
      const res = await API.post(`/blogs/${id}/like`);
      setBlog(res.data);
      setLiked(true);
    } catch {}
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "120px 0", color: "var(--ink-4)" }}>
      <span className="spin" style={{ display: "inline-block", width: 18, height: 18, border: "2px solid var(--border-2)", borderTopColor: "var(--indigo)", borderRadius: "50%" }} />
      <span style={{ fontSize: 13 }}>Loading…</span>
    </div>
  );

  if (!blog) return (
    <div style={{ textAlign: "center", padding: "120px 24px" }}>
      <p style={{ color: "var(--ink-3)", marginBottom: 16 }}>Story not found.</p>
      <button onClick={() => router.push("/")} style={{ color: "var(--indigo)", fontWeight: 600 }} className="hover:underline">← Back</button>
    </div>
  );

  const accentIdx  = parseInt(blog._id?.slice(-1) || "0", 16) % 6;
  const hasImage   = blog.image && !imgError;
  const apiBase    = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";
  const dateStr    = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

      {/* ── Back nav ──────────────────────────────── */}
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "20px 24px 0" }}>
        <button
          onClick={() => router.push("/")}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 13, fontWeight: 500, color: "var(--ink-3)",
            background: "none", border: "none", cursor: "pointer",
            padding: 0, transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--indigo)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-3)")}
        >
          ← All stories
        </button>
      </div>

      <div className="fade-up" style={{ maxWidth: 780, margin: "0 auto", padding: "20px 24px 80px" }}>

        {/* ── Cover image ───────────────────────────── */}
        <div style={{
          width: "100%",
          aspectRatio: "16 / 7",
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid var(--border)",
          boxShadow: "0 4px 32px rgba(79,53,210,0.10)",
          marginBottom: 32,
          background: "var(--bg-3)",
        }}>
          {hasImage ? (
            <img
              src={`${apiBase}/uploads/${blog.image}`}
              alt={blog.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={() => setImgError(true)}
            />
          ) : (
            <DefaultCover title={blog.title} accentIndex={accentIdx} height="100%" width="100%" />
          )}
        </div>

        {/* ── Title ─────────────────────────────────── */}
        <h1 style={{
          fontSize: "clamp(24px, 4vw, 38px)",
          fontWeight: 800,
          color: "var(--ink)",
          lineHeight: 1.2,
          letterSpacing: "-0.025em",
          marginBottom: 20,
        }}>
          {blog.title}
        </h1>

        {/* ── Meta bar ──────────────────────────────── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          padding: "14px 18px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          marginBottom: 36,
        }}>
          {/* Author */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--indigo), var(--indigo-3))",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, fontWeight: 800, flexShrink: 0,
            }}>
              {blog.author?.[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>@{blog.author}</p>
              {dateStr && (
                <p style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 1 }}>{dateStr}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 20,
              background: "var(--bg-2)", border: "1px solid var(--border)",
              fontSize: 12, fontWeight: 600, color: "var(--ink-3)",
            }}>
              <span style={{ fontSize: 14 }}>👁</span>
              <span>{blog.views.toLocaleString()}</span>
              <span style={{ color: "var(--ink-4)", fontWeight: 400 }}>views</span>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 20,
              background: liked ? "var(--coral-bg)" : "var(--bg-2)",
              border: `1px solid ${liked ? "rgba(240,90,79,0.25)" : "var(--border)"}`,
              fontSize: 12, fontWeight: 600,
              color: liked ? "var(--coral)" : "var(--ink-3)",
            }}>
              <span style={{ fontSize: 14 }}>{liked ? "♥" : "♡"}</span>
              <span>{blog.likes.toLocaleString()}</span>
              <span style={{ fontWeight: 400, color: liked ? "var(--coral)" : "var(--ink-4)" }}>likes</span>
            </div>
          </div>
        </div>

        {/* ── Divider ───────────────────────────────── */}
        <div style={{ height: 1, background: "var(--border)", marginBottom: 36 }} />

        {/* ── Body text ─────────────────────────────── */}
        <div style={{
          fontSize: 17,
          lineHeight: 1.95,
          color: "var(--ink-2)",
          whiteSpace: "pre-wrap",
          letterSpacing: "0.01em",
        }}>
          {blog.description}
        </div>

        {/* ── Like CTA ──────────────────────────────── */}
        <div style={{
          marginTop: 56,
          padding: "24px 28px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 3 }}>
              Enjoyed this story?
            </p>
            <p style={{ fontSize: 13, color: "var(--ink-4)" }}>
              Show the author some love with a like.
            </p>
          </div>
          <button
            onClick={handleLike}
            disabled={liked}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700,
              background: liked
                ? "linear-gradient(135deg, var(--coral), #f87171)"
                : "linear-gradient(135deg, var(--indigo), var(--indigo-2))",
              color: "#fff",
              border: "none",
              cursor: liked ? "default" : "pointer",
              boxShadow: liked
                ? "0 4px 14px rgba(240,90,79,0.3)"
                : "0 4px 14px rgba(79,53,210,0.3)",
              transition: "all 0.2s",
              opacity: liked ? 0.85 : 1,
            }}
          >
            <span style={{ fontSize: 16 }}>{liked ? "♥" : "♡"}</span>
            {liked ? "Liked!" : "Like this story"}
            <span style={{
              fontSize: 11, padding: "2px 8px", borderRadius: 10,
              background: "rgba(255,255,255,0.2)",
              color: "#fff",
            }}>
              {blog.likes}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
