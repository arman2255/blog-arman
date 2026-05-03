"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/services/api";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function CreatePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage]           = useState<File | null>(null);
  const [preview, setPreview]       = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) router.push("/login");
  }, [router]);

  useScrollReveal();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const submit = async () => {
    setError("");
    if (!title.trim() || !description.trim()) {
      setError("Title and content are required");
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (image) formData.append("image", image);
      await API.post("/blogs", formData);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.msg || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", border: "1.5px solid var(--border)", borderRadius: 8,
    fontSize: 14, color: "var(--ink)", background: "var(--bg)", outline: "none",
    padding: "11px 14px", transition: "border-color 0.2s",
  } as React.CSSProperties;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "40px 24px" }}>
      <div className="fade-up" style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* Back */}
        <button
          onClick={() => router.push("/")}
          style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 24, display: "inline-flex", alignItems: "center", gap: 4 }}
          className="hover:text-[var(--indigo)] transition-colors"
        >
          ← Back to stories
        </button>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            display: "inline-block", background: "var(--indigo-bg)",
            color: "var(--indigo)", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "3px 12px", borderRadius: 20, marginBottom: 10,
            border: "1px solid var(--indigo-border)",
          }}>
            New Story
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em" }}>
            Write something worth reading
          </h1>
        </div>

        {/* Form card */}
        <div style={{
          background: "var(--surface)", borderRadius: 16,
          border: "1px solid var(--border)",
          boxShadow: "0 4px 24px rgba(79,53,210,0.07)",
          overflow: "hidden",
        }}>
          <div style={{ height: 4, background: "linear-gradient(90deg, var(--indigo), var(--teal), var(--amber))" }} />
          <div style={{ padding: "28px 28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>

            {error && (
              <div style={{
                background: "var(--red-bg)", border: "1px solid rgba(220,38,38,0.2)",
                color: "var(--red)", borderRadius: 8, padding: "10px 14px", fontSize: 13, fontWeight: 500,
              }}>
                ⚠ {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Title
              </label>
              <input
                type="text" placeholder="Your story title"
                value={title} onChange={(e) => setTitle(e.target.value)}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--indigo)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Content */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Content
              </label>
              <textarea
                placeholder="Write your story…"
                value={description} onChange={(e) => setDescription(e.target.value)}
                rows={9}
                style={{ ...inputStyle, resize: "none", lineHeight: 1.75 }}
                onFocus={(e) => (e.target.style.borderColor = "var(--indigo)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Cover image */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)", display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Cover Image <span style={{ color: "var(--ink-4)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
              </label>
              {preview ? (
                <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1.5px solid var(--border)" }}>
                  <img src={preview} alt="Preview" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
                  <button
                    onClick={() => { setImage(null); setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    style={{
                      position: "absolute", top: 10, right: 10,
                      background: "rgba(0,0,0,0.65)", color: "#fff",
                      border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: "100%", height: 130,
                    border: "2px dashed var(--border-2)", borderRadius: 10,
                    background: "var(--bg-2)", color: "var(--ink-3)",
                    fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--indigo)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--indigo)";
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--indigo-bg)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-2)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-3)";
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-2)";
                  }}
                >
                  + Click to upload cover image
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>

            {/* Submit */}
            <button
              onClick={submit} disabled={loading}
              style={{
                height: 48,
                background: loading ? "var(--indigo-3)" : "linear-gradient(135deg, var(--indigo), var(--indigo-2))",
                color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 16px rgba(79,53,210,0.3)",
                transition: "opacity 0.2s",
              }}
              className="hover:opacity-90"
            >
              {loading ? "Publishing…" : "Publish Story"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
