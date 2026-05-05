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
  const [currentUser, setCurrentUser] = useState("");
  const [isAdmin, setIsAdmin]   = useState(false);

  // Edit modal state
  const [editing, setEditing]         = useState(false);
  const [editTitle, setEditTitle]     = useState("");
  const [editDesc, setEditDesc]       = useState("");
  const [editImage, setEditImage]     = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError]     = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const viewCounted = useRef(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) router.replace("/login");
    setCurrentUser(localStorage.getItem("username") || "");
    setIsAdmin(localStorage.getItem("isAdmin") === "true");
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

  const handleDelete = async () => {
    if (!confirm("Delete this story permanently?")) return;
    try {
      await API.delete(`/blogs/${id}`);
      router.push("/");
    } catch (err: any) {
      alert(err.response?.data?.msg || "Failed to delete");
    }
  };

  const openEdit = () => {
    if (!blog) return;
    setEditTitle(blog.title);
    setEditDesc(blog.description);
    setEditPreview(blog.image ? `${apiBase}/uploads/${blog.image}` : null);
    setEditImage(null);
    setEditError("");
    setEditing(true);
  };

  const closeEdit = () => {
    setEditing(false);
    setEditImage(null);
    setEditPreview(null);
    setEditError("");
  };

  const submitEdit = async () => {
    if (!editTitle.trim() || !editDesc.trim()) { setEditError("Title and content are required"); return; }
    setEditLoading(true);
    setEditError("");
    try {
      const formData = new FormData();
      formData.append("title", editTitle);
      formData.append("description", editDesc);
      if (editImage) formData.append("image", editImage);
      const res = await API.put(`/blogs/${id}`, formData);
      setBlog(res.data);
      closeEdit();
    } catch (err: any) {
      setEditError(err.response?.data?.msg || "Failed to update");
    } finally {
      setEditLoading(false);
    }
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
  const canEdit    = isAdmin || blog.author === currentUser;
  const dateStr    = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <>
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
            {/* Edit / Delete — visible to author and admin */}
            {canEdit && (
              <>
                <button
                  onClick={openEdit}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    color: "var(--teal)", border: "1px solid rgba(13,148,136,0.25)",
                    background: "var(--teal-bg)", cursor: "pointer",
                  }}
                  className="hover:opacity-80 transition-opacity"
                >
                  ✏ Edit
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    color: "var(--red)", border: "1px solid rgba(220,38,38,0.2)",
                    background: "var(--red-bg)", cursor: "pointer",
                  }}
                  className="hover:opacity-80 transition-opacity"
                >
                  🗑 Delete
                </button>
              </>
            )}
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

    {/* ── Edit Modal ─────────────────────────── */}
    {editing && (
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(10,8,30,0.55)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }}
        onClick={(e) => { if (e.target === e.currentTarget) closeEdit(); }}
      >
        <div style={{
          background: "var(--surface)", borderRadius: 16,
          border: "1px solid var(--border)",
          boxShadow: "0 24px 64px rgba(10,8,30,0.3)",
          width: "100%", maxWidth: 600, overflow: "hidden",
        }}>
          <div style={{ height: 4, background: "linear-gradient(90deg, var(--indigo), var(--teal), var(--amber))" }} />
          <div style={{ padding: "24px 28px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>Edit Story</h2>
              <button onClick={closeEdit} style={{ fontSize: 22, color: "var(--ink-4)", background: "none", border: "none", cursor: "pointer" }}>×</button>
            </div>
            {editError && (
              <div style={{ background: "var(--red-bg)", border: "1px solid rgba(220,38,38,0.2)", color: "var(--red)", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>⚠ {editError}</div>
            )}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>Title</label>
              <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 8, fontSize: 14, color: "var(--ink)", background: "var(--bg)", outline: "none", padding: "11px 14px" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--indigo)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>Content</label>
              <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={7}
                style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 8, fontSize: 14, color: "var(--ink)", background: "var(--bg)", outline: "none", padding: "11px 14px", resize: "none", lineHeight: 1.75 }}
                onFocus={(e) => (e.target.style.borderColor = "var(--indigo)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Cover Image <span style={{ color: "var(--ink-4)", fontWeight: 400, textTransform: "none" }}>(optional — leave to keep current)</span>
              </label>
              {editPreview ? (
                <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1.5px solid var(--border)" }}>
                  <img src={editPreview} alt="Preview" style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
                  <button onClick={() => { setEditImage(null); setEditPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.65)", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer" }}>
                    Remove
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  style={{ width: "100%", height: 90, border: "2px dashed var(--border-2)", borderRadius: 10, background: "var(--bg-2)", color: "var(--ink-3)", fontSize: 13, cursor: "pointer" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--indigo)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--indigo)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-2)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-3)"; }}
                >
                  + Click to upload new cover image
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0] || null; setEditImage(f); setEditPreview(f ? URL.createObjectURL(f) : null); }} className="hidden" />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={closeEdit} style={{ padding: "10px 20px", borderRadius: 9, fontSize: 13, fontWeight: 600, color: "var(--ink-3)", border: "1px solid var(--border)", background: "var(--bg-2)", cursor: "pointer" }}>Cancel</button>
              <button onClick={submitEdit} disabled={editLoading}
                style={{ padding: "10px 24px", borderRadius: 9, fontSize: 13, fontWeight: 700, background: editLoading ? "var(--indigo-3)" : "linear-gradient(135deg, var(--indigo), var(--indigo-2))", color: "#fff", cursor: editLoading ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(79,53,210,0.3)" }}
                className="hover:opacity-90"
              >
                {editLoading ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
