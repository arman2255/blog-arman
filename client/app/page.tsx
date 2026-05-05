"use client";

import { useEffect, useState } from "react";
import BlogCard from "@/components/BlogCard";
import { API } from "@/services/api";
import { useRouter } from "next/navigation";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function HomePage() {
  const [blogs, setBlogs]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => { setLoggedIn(!!localStorage.getItem("token")); }, []);

  useScrollReveal();

  useEffect(() => {
    setLoading(true);
    API.get("/blogs")
      .then((r) => setBlogs(r.data || []))
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

      {/* ── Hero ─────────────────────────────── */}
      <section style={{
        background: "linear-gradient(135deg, var(--indigo) 0%, var(--indigo-2) 50%, #a78bfa 100%)",
        padding: "72px 24px 64px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

        <div style={{ maxWidth: 560, margin: "0 auto", position: "relative" }} className="fade-up">
          <div style={{
            display: "inline-block", background: "rgba(255,255,255,0.15)",
            color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", padding: "4px 14px", borderRadius: 20, marginBottom: 20,
          }}>
            ✦ Welcome to Blogify
          </div>
          <h1 style={{ fontSize: 42, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
            Stories worth<br />reading
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", marginBottom: 36, lineHeight: 1.65 }}>
            Discover ideas and perspectives from writers around the world.
          </p>

          {!loggedIn ? (
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => router.push("/register")}
                style={{
                  background: "#fff", color: "var(--indigo)",
                  padding: "11px 28px", borderRadius: 10,
                  fontSize: 14, fontWeight: 700,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                }}
                className="hover:opacity-90 transition-opacity"
              >
                Get started free
              </button>
              <button
                onClick={() => router.push("/login")}
                style={{
                  background: "rgba(255,255,255,0.15)", color: "#fff",
                  border: "1.5px solid rgba(255,255,255,0.35)",
                  padding: "11px 28px", borderRadius: 10,
                  fontSize: 14, fontWeight: 600,
                }}
                className="hover:bg-white/25 transition-colors"
              >
                Log in
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/create")}
              style={{
                background: "#fff", color: "var(--indigo)",
                padding: "11px 28px", borderRadius: 10,
                fontSize: 14, fontWeight: 700,
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              }}
              className="hover:opacity-90 transition-opacity"
            >
              + Write a story
            </button>
          )}
        </div>
      </section>

      {/* ── Stats bar ────────────────────────── */}
      <div className="reveal" style={{
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        padding: "14px 24px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-2)" }}>
            {loading ? "Loading…" : blogs.length === 0 ? "No stories yet" : `Latest Stories · ${blogs.length}`}
          </h2>
        </div>
      </div>

      {/* ── Grid ─────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 60px" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "80px 0", color: "var(--ink-4)" }}>
            <span className="spin" style={{
              display: "inline-block", width: 18, height: 18,
              border: "2px solid var(--border-2)", borderTopColor: "var(--indigo)", borderRadius: "50%",
            }} />
            <span style={{ fontSize: 13 }}>Loading stories…</span>
          </div>
        ) : blogs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--ink-4)" }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>✍️</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--ink-2)", marginBottom: 8 }}>No stories yet</p>
            <p style={{ fontSize: 13, marginBottom: 24 }}>Be the first to write something.</p>
            {loggedIn ? (
              <button
                onClick={() => router.push("/create")}
                style={{
                  background: "linear-gradient(135deg, var(--indigo), var(--indigo-2))",
                  color: "#fff", padding: "10px 24px", borderRadius: 10,
                  fontSize: 13, fontWeight: 700,
                  boxShadow: "0 4px 14px rgba(79,53,210,0.3)",
                }}
                className="hover:opacity-90 transition-opacity"
              >
                + Write a story
              </button>
            ) : (
              <button
                onClick={() => router.push("/register")}
                style={{
                  background: "linear-gradient(135deg, var(--indigo), var(--indigo-2))",
                  color: "#fff", padding: "10px 24px", borderRadius: 10,
                  fontSize: 13, fontWeight: 700,
                  boxShadow: "0 4px 14px rgba(79,53,210,0.3)",
                }}
                className="hover:opacity-90 transition-opacity"
              >
                Create account to write
              </button>
            )}
          </div>
        ) : (
          <div className="stagger" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 24,
          }}>
            {blogs.map((b) => (
              <BlogCard key={b._id} blog={b} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
