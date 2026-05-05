"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/services/api";
import DefaultCover from "@/components/DefaultCover";

type Blog = {
  _id: string;
  title: string;
  description: string;
  image: string;
  views: number;
  likes: number;
  createdAt: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

export default function ProfilePage() {
  const router  = useRouter();
  const [blogs, setBlogs]       = useState<Blog[]>([]);
  const [loading, setLoading]   = useState(true);
  const [username, setUsername] = useState("");

  // Edit modal state
  const [editing, setEditing]         = useState<Blog | null>(null);
  const [editTitle, setEditTitle]     = useState("");
  const [editDesc, setEditDesc]       = useState("");
  const [editImage, setEditImage]     = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError]     = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.replace("/login"); return; }
    setUsername(localStorage.getItem("username") || "");
    fetchMyBlogs();
  }, []);

  const fetchMyBlogs = async () => {
    setLoading(true);
    try {
      const res = await API.get("/blogs/mine");
      setBlogs(res.data || []);
    } catch {
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this story permanently?")) return;
    try {
      await API.delete(`/blogs/${id}`);
      setBlogs((prev) => prev.filter((b) => b._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.msg || "Failed to delete");
    }
  };

  const openEdit = (blog: Blog) => {
    setEditing(blog);
    setEditTitle(blog.title);
    setEditDesc(blog.description);
    setEditImage(null);
    setEditPreview(blog.image ? `${API_BASE}/uploads/${blog.image}` : null);
    setEditError("");
  };

  const closeEdit = () => {
    setEditing(null);
    setEditImage(null);
    setEditPreview(null);
    setEditError("");
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setEditImage(file);
    setEditPreview(file ? URL.createObjectURL(file) : null);
  };

  const submitEdit = async () => {
    if (!editing) return;
    if (!editTitle.trim() || !editDesc.trim()) {
      setEditError("Title and content are required");
      return;
    }
    setEditLoading(true);
    setEditError("");
    try {
      const formData = new FormData();
      formData.append("title", editTitle);
      formData.append("description", editDesc);
      if (editImage) formData.append("image", editImage);
      const res = await API.put(`/blogs/${editing._id}`, formData);
      setBlogs((prev) => prev.map((b) => (b._id === editing._id ? res.data : b)));
      closeEdit();
    } catch (err: any) {
      setEditError(err.response?.data?.msg || "Failed to update");
    } finally {
      setEditLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", border: "1.5px solid var(--border)", borderRadius: 8,
    fontSize: 14, color: "var(--ink)", background: "var(--bg)", outline: "none",
    padding: "11px 14px", transition: "border-color 0.2s",
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "40px 24px" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 52, height: 52, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--indigo), var(--indigo-3))",
              color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 10,
            }}>
              {username[0]?.toUpperCase()}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em" }}>
              @{username}
            </h1>
            <p style={{ fontSize: 13, color: "var(--ink-4)", marginTop: 2 }}>
              {blogs.length} {blogs.length === 1 ? "story" : "stories"}
            </p>
          </div>
          <button
            onClick={() => router.push("/create")}
            style={{
              background: "linear-gradient(135deg, var(--indigo), var(--indigo-2))",
              color: "#fff", padding: "10px 20px", borderRadius: 10,
              fontSize: 13, fontWeight: 700,
              boxShadow: "0 4px 14px rgba(79,53,210,0.3)",
            }}
            className="hover:opacity-90 transition-opacity"
          >
            + New Story
          </button>
        </div>

        {/* Blog list */}
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "80px 0", color: "var(--ink-4)" }}>
            <span className="spin" style={{ display: "inline-block", width: 18, height: 18, border: "2px solid var(--border-2)", borderTopColor: "var(--indigo)", borderRadius: "50%" }} />
            <span style={{ fontSize: 13 }}>Loading your stories…</span>
          </div>
        ) : blogs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--ink-4)" }}>
            <p style={{ fontSize: 36, marginBottom: 14 }}>✍️</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-2)", marginBottom: 8 }}>No stories yet</p>
            <p style={{ fontSize: 13, marginBottom: 24 }}>Write your first story and share it with the world.</p>
            <button
              onClick={() => router.push("/create")}
              style={{
                background: "linear-gradient(135deg, var(--indigo), var(--indigo-2))",
                color: "#fff", padding: "10px 24px", borderRadius: 10,
                fontSize: 13, fontWeight: 700,
                boxShadow: "0 4px 14px rgba(79,53,210,0.3)",
              }}
            >
              + Write a story
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {blogs.map((blog) => {
              const accentIdx = parseInt(blog._id?.slice(-1) || "0", 16) % 6;
              const hasImage = !!blog.image;
              return (
                <div
                  key={blog._id}
                  style={{
                    background: "var(--surface)", borderRadius: 14,
                    border: "1px solid var(--border)",
                    boxShadow: "0 2px 12px rgba(79,53,210,0.05)",
                    overflow: "hidden", display: "flex", gap: 0,
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{ width: 140, flexShrink: 0, position: "relative", overflow: "hidden" }}>
                    {hasImage ? (
                      <img
                        src={`${API_BASE}/uploads/${blog.image}`}
                        alt={blog.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    ) : (
                      <DefaultCover title={blog.title} accentIndex={accentIdx} height="100%" width="100%" />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 6, lineHeight: 1.4 }}>
                        {blog.title}
                      </h2>
                      <p style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {blog.description}
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, flexWrap: "wrap", gap: 10 }}>
                      {/* Stats */}
                      <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--ink-4)" }}>
                        <span>📅 {fmt(blog.createdAt)}</span>
                        <span>👁 {blog.views}</span>
                        <span>♡ {blog.likes}</span>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => router.push(`/blog/${blog._id}`)}
                          style={{
                            fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 7,
                            color: "var(--indigo)", border: "1px solid var(--indigo-border)",
                            background: "var(--indigo-bg)", cursor: "pointer",
                          }}
                          className="hover:opacity-80 transition-opacity"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openEdit(blog)}
                          style={{
                            fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 7,
                            color: "var(--teal)", border: "1px solid rgba(13,148,136,0.25)",
                            background: "var(--teal-bg)", cursor: "pointer",
                          }}
                          className="hover:opacity-80 transition-opacity"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(blog._id)}
                          style={{
                            fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 7,
                            color: "var(--red)", border: "1px solid rgba(220,38,38,0.2)",
                            background: "var(--red-bg)", cursor: "pointer",
                          }}
                          className="hover:opacity-80 transition-opacity"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Edit Modal ─────────────────────────── */}
      {editing && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(10,8,30,0.55)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeEdit(); }}
        >
          <div style={{
            background: "var(--surface)", borderRadius: 16,
            border: "1px solid var(--border)",
            boxShadow: "0 24px 64px rgba(10,8,30,0.3)",
            width: "100%", maxWidth: 600,
            overflow: "hidden",
          }}>
            {/* Top bar */}
            <div style={{ height: 4, background: "linear-gradient(90deg, var(--indigo), var(--teal), var(--amber))" }} />
            <div style={{ padding: "24px 28px 28px", display: "flex", flexDirection: "column", gap: 18 }}>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>Edit Story</h2>
                <button
                  onClick={closeEdit}
                  style={{ fontSize: 20, color: "var(--ink-4)", background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}
                >
                  ×
                </button>
              </div>

              {editError && (
                <div style={{ background: "var(--red-bg)", border: "1px solid rgba(220,38,38,0.2)", color: "var(--red)", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
                  ⚠ {editError}
                </div>
              )}

              {/* Title */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>Title</label>
                <input
                  type="text" value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--indigo)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>

              {/* Content */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>Content</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={7}
                  style={{ ...inputStyle, resize: "none", lineHeight: 1.75 }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--indigo)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>

              {/* Cover image */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Cover Image <span style={{ color: "var(--ink-4)", fontWeight: 400, textTransform: "none" }}>(optional — leave to keep current)</span>
                </label>
                {editPreview ? (
                  <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1.5px solid var(--border)" }}>
                    <img src={editPreview} alt="Preview" style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} />
                    <button
                      onClick={() => { setEditImage(null); setEditPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.65)", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer" }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: "100%", height: 100,
                      border: "2px dashed var(--border-2)", borderRadius: 10,
                      background: "var(--bg-2)", color: "var(--ink-3)",
                      fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--indigo)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--indigo)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-2)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-3)"; }}
                  >
                    + Click to upload new cover image
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleEditImageChange} className="hidden" />
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  onClick={closeEdit}
                  style={{ padding: "10px 20px", borderRadius: 9, fontSize: 13, fontWeight: 600, color: "var(--ink-3)", border: "1px solid var(--border)", background: "var(--bg-2)", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={submitEdit} disabled={editLoading}
                  style={{
                    padding: "10px 24px", borderRadius: 9, fontSize: 13, fontWeight: 700,
                    background: editLoading ? "var(--indigo-3)" : "linear-gradient(135deg, var(--indigo), var(--indigo-2))",
                    color: "#fff", cursor: editLoading ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 14px rgba(79,53,210,0.3)",
                  }}
                  className="hover:opacity-90"
                >
                  {editLoading ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
