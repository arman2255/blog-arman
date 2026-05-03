"use client";

import { useEffect, useState } from "react";
import BlogCard from "@/components/BlogCard";
import { API } from "@/services/api";
import { useRouter } from "next/navigation";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import DefaultCover from "@/components/DefaultCover";

const SAMPLE_BLOGS = [
  { _id: "s1", title: "How to Build a Habit That Actually Sticks", author: "sarah_m", image: "" },
  { _id: "s2", title: "The Quiet Power of Doing Less", author: "james_o", image: "" },
  { _id: "s3", title: "What Traveling Alone Taught Me About People", author: "priya_n", image: "" },
  { _id: "s4", title: "Why Deep Work Is the Skill of the Century", author: "alex_k", image: "" },
  { _id: "s5", title: "The Art of Saying No Without Guilt", author: "mia_r", image: "" },
  { _id: "s6", title: "Morning Routines Are Overrated", author: "dan_w", image: "" },
];

export default function HomePage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => { setLoggedIn(!!localStorage.getItem("token")); }, []);

  useScrollReveal();

  useEffect(() => {
    API.get("/blogs")
      .then((r) => setBlogs(r.data || []))
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, []);

  const displayBlogs = !loading && blogs.length === 0 ? SAMPLE_BLOGS : blogs;
  const isSample = !loading && blogs.length === 0;

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
        {/* Decorative circles */}
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
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-2)" }}>
            {isSample ? "✦ Featured Stories" : `Latest Stories · ${blogs.length}`}
          </h2>
          {isSample && (
            <span style={{
              fontSize: 11, color: "var(--coral)", background: "var(--coral-bg)",
              border: "1px solid rgba(240,90,79,0.2)", borderRadius: 20, padding: "2px 10px", fontWeight: 600,
            }}>
              Sample
            </span>
          )}
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
        ) : (
          <div className="stagger" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 24,
          }}>
            {displayBlogs.map((b) =>
              isSample ? (
                <article
                  key={b._id}
                  onClick={() => router.push("/login")}
                  className="group cursor-pointer"
                  style={{
                    background: "var(--surface)", borderRadius: 14,
                    overflow: "hidden", border: "1px solid var(--border)",
                    boxShadow: "0 2px 12px rgba(79,53,210,0.06)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(79,53,210,0.14)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(79,53,210,0.06)";
                  }}
                >
                  {/* Default cover with initials */}
                  <div style={{ aspectRatio: "16/9", position: "relative", overflow: "hidden" }}>
                    <DefaultCover title={b.title} accentIndex={parseInt(b._id.slice(-1), 16) % 6} height="100%" />
                    <div style={{
                      position: "absolute", top: 0, left: 0, right: 0, height: 4,
                      background: ["linear-gradient(135deg,#4f35d2,#8b74f0)", "linear-gradient(135deg,#f05a4f,#f59e0b)", "linear-gradient(135deg,#0d9488,#4f35d2)", "linear-gradient(135deg,#f59e0b,#f05a4f)", "linear-gradient(135deg,#6b52e8,#0d9488)", "linear-gradient(135deg,#f05a4f,#6b52e8)"][parseInt(b._id.slice(-1), 16) % 6],
                    }} />
                  </div>                  <div style={{ padding: "14px 16px 16px" }}>
                    <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", lineHeight: 1.4, marginBottom: 6 }}
                      className="group-hover:text-[var(--indigo)] transition-colors"
                    >
                      {b.title}
                    </h2>
                    <p style={{ fontSize: 12, color: "var(--ink-3)" }}>@{b.author}</p>
                  </div>
                </article>
              ) : (
                <BlogCard key={b._id} blog={b} />
              )
            )}
          </div>
        )}

        {/* CTA */}
        {isSample && !loggedIn && (
          <div className="reveal" style={{
            marginTop: 40, padding: "28px 32px", borderRadius: 14,
            background: "linear-gradient(135deg, var(--indigo-bg), var(--bg-2))",
            border: "1px solid var(--indigo-border)", textAlign: "center",
          }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--indigo)", marginBottom: 6 }}>
              Sign in to read full stories
            </p>
            <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 20 }}>
              Create a free account to read, write, and like posts.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={() => router.push("/register")}
                style={{
                  background: "linear-gradient(135deg, var(--indigo), var(--indigo-2))",
                  color: "#fff", padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                  boxShadow: "0 2px 10px rgba(79,53,210,0.3)",
                }}
                className="hover:opacity-90 transition-opacity"
              >
                Create account
              </button>
              <button
                onClick={() => router.push("/login")}
                style={{
                  border: "1.5px solid var(--indigo-border)", color: "var(--indigo)",
                  padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "var(--surface)",
                }}
                className="hover:bg-[var(--indigo-bg)] transition-colors"
              >
                Log in
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
