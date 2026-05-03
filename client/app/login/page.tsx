"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/services/api";

type FieldErrors = { username?: string; password?: string };

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched]   = useState<Record<string, boolean>>({});
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) router.replace("/");
  }, [router]);

  const validateField = (name: string, value: string): string => {
    if (name === "username" && !value.trim()) return "Username is required";
    if (name === "password" && !value)        return "Password is required";
    return "";
  };

  const handleChange = (name: string, value: string) => {
    if (name === "username") setUsername(value);
    if (name === "password") setPassword(value);
    if (touched[name]) {
      const err = validateField(name, value);
      setFieldErrors(prev => ({ ...prev, [name]: err || undefined }));
    }
  };

  const handleBlur = (name: string, value: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: err || undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ username: true, password: true });

    const errs: FieldErrors = {};
    if (!username.trim()) errs.username = "Username is required";
    if (!password)        errs.password = "Password is required";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setFieldErrors({});
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("isAdmin", res.data.isAdmin ? "true" : "false");
      router.push("/");
    } catch (err: any) {
      const msg: string = err.response?.data?.msg || "Login failed";
      if (msg === "Invalid credentials") {
        setFieldErrors({ username: "Invalid username or password", password: "Invalid username or password" });
      } else if (msg.includes("password")) {
        setFieldErrors({ password: msg });
      } else if (msg.includes("username") || msg.includes("Username")) {
        setFieldErrors({ username: msg });
      } else {
        setFieldErrors({ username: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (name: "username" | "password"): React.CSSProperties => ({
    width: "100%", height: 44, padding: "0 14px",
    border: `1.5px solid ${fieldErrors[name] ? "var(--red)" : "var(--border)"}`,
    borderRadius: 8, fontSize: 14, color: "var(--ink)",
    background: fieldErrors[name] ? "rgba(220,38,38,0.03)" : "var(--bg)",
    outline: "none", transition: "border-color 0.2s",
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="fade-up" style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)", boxShadow: "0 8px 40px rgba(79,53,210,0.1)", overflow: "hidden" }}>
          <div style={{ height: 5, background: "linear-gradient(90deg, var(--indigo), var(--indigo-3), #a78bfa)" }} />

          <div style={{ padding: "32px 32px 28px" }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, var(--indigo), var(--indigo-3))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15 }}>B</div>
              <span style={{ fontWeight: 700, fontSize: 18, color: "var(--indigo)" }}>Blogify</span>
            </div>

            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", marginBottom: 4 }}>Log in</h1>
            <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 20 }}>Welcome back!</p>


            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Username */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: fieldErrors.username ? "var(--red)" : "var(--ink-2)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Username
                </label>
                <input
                  type="text" placeholder="Your username"
                  value={username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  onBlur={(e) => handleBlur("username", e.target.value)}
                  style={inputStyle("username")}
                  onFocus={(e) => { if (!fieldErrors.username) e.target.style.borderColor = "var(--indigo)"; }}
                />
                {fieldErrors.username && (
                  <p style={{ fontSize: 12, color: "var(--red)", marginTop: 4, display: "flex", alignItems: "center", gap: 3 }}>⚠ {fieldErrors.username}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: fieldErrors.password ? "var(--red)" : "var(--ink-2)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Password
                </label>
                <input
                  type="password" placeholder="••••••••"
                  value={password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onBlur={(e) => handleBlur("password", e.target.value)}
                  style={inputStyle("password")}
                  onFocus={(e) => { if (!fieldErrors.password) e.target.style.borderColor = "var(--indigo)"; }}
                />
                {fieldErrors.password && (
                  <p style={{ fontSize: 12, color: "var(--red)", marginTop: 4, display: "flex", alignItems: "center", gap: 3 }}>⚠ {fieldErrors.password}</p>
                )}
              </div>

              <button
                type="submit" disabled={loading}
                style={{ height: 46, marginTop: 4, background: loading ? "var(--indigo-3)" : "linear-gradient(135deg, var(--indigo), var(--indigo-2))", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(79,53,210,0.3)", transition: "opacity 0.2s" }}
                className="hover:opacity-90"
              >
                {loading ? "Logging in…" : "Log In"}
              </button>
            </form>

            <p style={{ fontSize: 13, color: "var(--ink-3)", textAlign: "center", marginTop: 20 }}>
              No account?{" "}
              <button onClick={() => router.push("/register")} style={{ color: "var(--indigo)", fontWeight: 700 }} className="hover:underline underline-offset-2">Sign in</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
