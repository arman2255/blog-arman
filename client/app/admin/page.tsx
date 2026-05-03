"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/services/api";

type Stats = { totalUsers: number; totalBlogs: number; totalViews: number; totalLikes: number };
type User  = { _id: string; username: string; email: string; createdAt: string };
type Blog  = { _id: string; title: string; author: string; views: number; likes: number; createdAt: string };

type Tab = "overview" | "users" | "blogs";

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab]       = useState<Tab>("overview");
  const [stats, setStats]   = useState<Stats | null>(null);
  const [users, setUsers]   = useState<User[]>([]);
  const [blogs, setBlogs]   = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUsername = typeof window !== "undefined" ? localStorage.getItem("username") : null;

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
  );
}
