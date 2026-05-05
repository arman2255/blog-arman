"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/services/api";

type Stats = { totalUsers: number; totalBlogs: number; totalViews: number; totalLikes: number };
type User  = { _id: string; username: string; email: string; createdAt: string };
type Blog  = { _id: string; title: string; description: string; author: string; image: string; views: number; likes: number; createdAt: string };

type Tab = "overview" | "users" | "blogs";

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab]       = useState<Tab>("overview");
  const [stats, setStats]   = useState<Stats | null>(null);
  const [users, setUsers]   = useState<User[]>([]);
  const [blogs, setBlogs]   = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUsername = typeof window !== "undefined" ? localStorage.getItem("username") : null;

  // Edit blog modal
  const [editing, setEditing]         = useState<Blog | null>(null);
  const [editTitle, setEditTitle]     = useState("");
  const [editDesc, setEditDesc]       = useState("");
  const [editImage, setEditImage]     = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError]     = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.replace("/login"); return; }
    if (localStorage.getItem("isAdmin") !== "true") { router.replace("/"); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, u, b] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/admin/users"),
        API.get("/admin/blogs"),
      ]);
      setStats(s.data);
      setUsers(u.data);
      setBlogs(b.data);
    } catch {
      router.replace("/");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user and all their blogs?")) return;
    try {
      await API.delete(`/admin/users/${id}`);
      fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.msg || "Failed to delete user");
    }
  };

  const deleteBlog = async (id: string) => {
    if (!confirm("Delete this blog?")) return;
    await API.delete(`/admin/blogs/${id}`);
    fetchAll();
  };

  const openEdit = (blog: Blog) => {
    setEditing(blog);
    setEditTitle(blog.title);
    setEditDesc(blog.description);
    setEditPreview(blog.image ? `${API_BASE}/uploads/${blog.image}` : null);
    setEditImage(null);
    setEditError("");
  };

  const closeEdit = () => { setEditing(null); setEditImage(null); setEditPreview(null); setEditError(""); };

  const submitEdit = async () => {
    if (!editing) return;
    if (!editTitle.trim() || !editDesc.trim()) { setEditError("Title and content are required"); return; }
    setEditLoading(true);
    setEditError("");
    try {
      const formData = new FormData();
      formData.append("title", editTitle);
      formData.append("description", editDesc);
      if (editImage) formData.append("image", editImage);
      await API.put(`/blogs/${editing._id}`, formData);
      closeEdit();
      fetchAll();
    } catch (err: any) {
      setEditError(err.response?.data?.msg || "Failed to update");
    } finally {
      setEditLoading(false);
    }
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
    cursor: "pointer", transition: "all 0.15s",
    background: tab === t ? "var(--indigo)" : "transparent",
    color: tab === t ? "#fff" : "var(--ink-3)",
    border: tab === t ? "none" : "1px solid transparent",
  });

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "120px 0", color: "var(--ink-4)" }}>
      <span className="spin" style={{ display: "inline-block", width: 18, height: 18, border: "2px solid var(--border-2)", borderTopColor: "var(--indigo)", borderRadius: "50%" }} />
      <span style={{ fontSize: 13 }}>Loading admin panel…</span>
    </div>
  );

  return (
    <>
    <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "32px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <div style={{ display: "inline-block", background: "var(--indigo-bg)", color: "var(--indigo)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 12px", borderRadius: 20, marginBottom: 8, border: "1px solid var(--indigo-border)" }}>
              Admin Panel
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em" }}>Dashboard</h1>
          </div>
          <button
            onClick={() => router.push("/")}
            style={{ fontSize: 13, color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 4 }}
            className="hover:text-[var(--indigo)] transition-colors"
          >
            ← Back to site
          </button>
        </div>

        {/* Stats cards */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
            {[
              { label: "Total Users",  value: stats.totalUsers,  color: "var(--indigo)", bg: "var(--indigo-bg)", icon: "👤" },
              { label: "Total Blogs",  value: stats.totalBlogs,  color: "var(--teal)",   bg: "var(--teal-bg)",   icon: "📝" },
              { label: "Total Views",  value: stats.totalViews,  color: "var(--amber)",  bg: "var(--amber-bg)",  icon: "👁" },
              { label: "Total Likes",  value: stats.totalLikes,  color: "var(--coral)",  bg: "var(--coral-bg)",  icon: "❤️" },
            ].map((s) => (
              <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 20px 16px", boxShadow: "0 2px 10px rgba(79,53,210,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</span>
                  <span style={{ fontSize: 20, background: s.bg, padding: "4px 8px", borderRadius: 8 }}>{s.icon}</span>
                </div>
                <p style={{ fontSize: 32, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em" }}>{s.value.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, background: "var(--surface)", padding: 6, borderRadius: 10, border: "1px solid var(--border)", width: "fit-content" }}>
          {(["overview", "users", "blogs"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={tabStyle(t)}>
              {t === "overview" ? "📊 Overview" : t === "users" ? `👤 Users (${users.length})` : `📝 Blogs (${blogs.length})`}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Recent users */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>Recent Users</h3>
                <button onClick={() => setTab("users")} style={{ fontSize: 12, color: "var(--indigo)", fontWeight: 600 }} className="hover:underline">View all</button>
              </div>
              {users.slice(0, 5).map((u) => (
                <div key={u._id} style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, var(--indigo), var(--indigo-3))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                    {u.username[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@{u.username}</p>
                    <p style={{ fontSize: 11, color: "var(--ink-4)" }}>{fmt(u.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent blogs */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>Recent Blogs</h3>
                <button onClick={() => setTab("blogs")} style={{ fontSize: 12, color: "var(--indigo)", fontWeight: 600 }} className="hover:underline">View all</button>
              </div>
              {blogs.slice(0, 5).map((b) => (
                <div key={b._id} style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.title}</p>
                  <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--ink-4)" }}>
                    <span>@{b.author}</span>
                    <span>👁 {b.views}</span>
                    <span>❤️ {b.likes}</span>
                    <span>{fmt(b.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users tab */}
        {tab === "users" && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg-2)" }}>
                  {["User", "Email", "Joined", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, var(--indigo), var(--indigo-3))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                          {u.username[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>@{u.username}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--ink-3)" }}>{u.email}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--ink-4)" }}>{fmt(u.createdAt)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {u.username === currentUsername ? (
                        <span style={{ fontSize: 12, color: "var(--ink-4)", padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-2)" }}>
                          You
                        </span>
                      ) : (
                        <button
                          onClick={() => deleteUser(u._id)}
                          style={{ fontSize: 12, color: "var(--red)", fontWeight: 600, padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(220,38,38,0.2)", background: "var(--red-bg)", cursor: "pointer" }}
                          className="hover:opacity-80 transition-opacity"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <p style={{ padding: 24, textAlign: "center", color: "var(--ink-4)", fontSize: 13 }}>No users yet</p>}
          </div>
        )}

        {/* Blogs tab */}
        {tab === "blogs" && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg-2)" }}>
                  {["Title", "Author", "Views", "Likes", "Date", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blogs.map((b) => (
                  <tr key={b._id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "var(--ink)", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.title}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--indigo)", fontWeight: 600 }}>@{b.author}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--ink-3)" }}>{b.views}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--ink-3)" }}>{b.likes}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--ink-4)" }}>{fmt(b.createdAt)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => router.push(`/blog/${b._id}`)}
                          style={{ fontSize: 12, color: "var(--indigo)", fontWeight: 600, padding: "4px 10px", borderRadius: 6, border: "1px solid var(--indigo-border)", background: "var(--indigo-bg)", cursor: "pointer" }}
                          className="hover:opacity-80 transition-opacity"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openEdit(b)}
                          style={{ fontSize: 12, color: "var(--teal)", fontWeight: 600, padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(13,148,136,0.25)", background: "var(--teal-bg)", cursor: "pointer" }}
                          className="hover:opacity-80 transition-opacity"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteBlog(b._id)}
                          style={{ fontSize: 12, color: "var(--red)", fontWeight: 600, padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(220,38,38,0.2)", background: "var(--red-bg)", cursor: "pointer" }}
                          className="hover:opacity-80 transition-opacity"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {blogs.length === 0 && <p style={{ padding: 24, textAlign: "center", color: "var(--ink-4)", fontSize: 13 }}>No blogs yet</p>}
          </div>
        )}
      </div>
    </div>

    {/* ── Edit Blog Modal ─────────────────────── */}
    {editing && (
      <div
        style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(10,8,30,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
        onClick={(e) => { if (e.target === e.currentTarget) closeEdit(); }}
      >
        <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)", boxShadow: "0 24px 64px rgba(10,8,30,0.3)", width: "100%", maxWidth: 600, overflow: "hidden" }}>
          <div style={{ height: 4, background: "linear-gradient(90deg, var(--coral), var(--amber), var(--indigo))" }} />
          <div style={{ padding: "24px 28px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>Edit Blog <span style={{ fontSize: 13, color: "var(--ink-4)", fontWeight: 400 }}>— Admin</span></h2>
              <button onClick={closeEdit} style={{ fontSize: 22, color: "var(--ink-4)", background: "none", border: "none", cursor: "pointer" }}>×</button>
            </div>
            {editError && <div style={{ background: "var(--red-bg)", border: "1px solid rgba(220,38,38,0.2)", color: "var(--red)", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>⚠ {editError}</div>}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>Title</label>
              <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 8, fontSize: 14, color: "var(--ink)", background: "var(--bg)", outline: "none", padding: "11px 14px" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--indigo)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>Content</label>
              <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={7}
                style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 8, fontSize: 14, color: "var(--ink)", background: "var(--bg)", outline: "none", padding: "11px 14px", resize: "none", lineHeight: 1.75 }}
                onFocus={(e) => (e.target.style.borderColor = "var(--indigo)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Cover Image <span style={{ color: "var(--ink-4)", fontWeight: 400, textTransform: "none" }}>(optional)</span>
              </label>
              {editPreview ? (
                <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1.5px solid var(--border)" }}>
                  <img src={editPreview} alt="Preview" style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
                  <button onClick={() => { setEditImage(null); setEditPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.65)", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer" }}>Remove</button>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  style={{ width: "100%", height: 90, border: "2px dashed var(--border-2)", borderRadius: 10, background: "var(--bg-2)", color: "var(--ink-3)", fontSize: 13, cursor: "pointer" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--indigo)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--indigo)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-2)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-3)"; }}
                >+ Click to upload new cover image</button>
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
