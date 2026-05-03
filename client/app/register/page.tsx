"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/services/api";

type FieldErrors = { username?: string; email?: string; password?: string };

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched]   = useState<Record<string, boolean>>({});
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) router.replace("/");
  }, [router]);

  // Validate a single field on the fly
  const validateField = (name: string, value: string): string => {
    if (name === "username") {
      if (!value.trim())          return "Username is required";
      if (value.length < 3)       return "At least 3 characters";
      if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Letters, numbers and _ only";
    }
    if (name === "email") {
      if (!value.trim())          return "Email is required";
      if (!/\S+@\S+\.\S+/.test(value)) return "Enter a valid email";
    }
    if (name === "password") {
      if (!value)                 return "Password is required";
      if (value.length < 6)       return "At least 6 characters";
    }
    return "";
  };

  const handleChange = (name: string, value: string) => {
    if (name === "username") setUsername(value);
    if (name === "email")    setEmail(value);
    if (name === "password") setPassword(value);

    // Only show inline error after field was touched
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

    // Mark all touched and validate all
    setTouched({ username: true, email: true, password: true });
    const errs: FieldErrors = {};
    const uErr = validateField("username", username);
    const eErr = validateField("email", email);
    const pErr = validateField("password", password);
    if (uErr) errs.username = uErr;
    if (eErr) errs.email    = eErr;
    if (pErr) errs.password = pErr;

    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setFieldErrors({});
    setLoading(true);
    try {
      const res = await API.post("/auth/register", { username, email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("isAdmin", "false");
      router.push("/");
    } catch (err: any) {
      const msg: string = err.response?.data?.msg || "";
      const detail: string = err.response?.data?.detail || "";
      const status: number = err.response?.status || 500;

      if (msg === "Username already taken")
        setFieldErrors({ username: "This username is already taken" });
      else if (msg === "Email already in use")
        setFieldErrors({ email: "This email is already registered" });
      else if (msg === "Username, email and password are required")
        setFieldErrors({ username: "Required", email: "Required", password: "Required" });
      else if (status === 500 || !msg)
        setFieldErrors({ username: detail ? `Server error: ${detail}` : "Something went wrong. Please try again." });
      else
        setFieldErrors({ username: msg });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (name: "username" | "email" | "password"): React.CSSProperties => ({
    width: "100%", height: 44, padding: "0 14px",
    border: `1.5px solid ${fieldErrors[name] ? "var(--red)" : "var(--border)"}`,
    borderRadius: 8, fontSize: 14, color: "var(--ink)",
    background: fieldErrors[name] ? "rgba(220,38,38,0.03)" : "var(--bg)",
    outline: "none", transition: "border-color 0.2s",
  });

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="fade-up" style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)", boxShadow: "0 8px 40px rgba(79,53,210,0.1)", overflow: "hidden" }}>
          <div style={{ height: 5, background: "linear-gradient(90deg, var(--coral), var(--amber), var(--indigo))" }} />

          <div style={{ padding: "32px 32px 28px" }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, var(--indigo), var(--indigo-3))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15 }}>B</div>
              <span style={{ fontWeight: 700, fontSize: 18, color: "var(--indigo)" }}>Blogify</span>
            </div>

            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", marginBottom: 4 }}>Create account</h1>
            <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 24 }}>Join Blogify and start writing.</p>

            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Username */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: fieldErrors.username ? "var(--red)" : "var(--ink-2)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Username
                </label>
                <input
                  type="text" placeholder="e.g. john_doe"
                  value={username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  onBlur={(e) => handleBlur("username", e.target.value)}
                  style={inputStyle("username")}
                  onFocus={(e) => { if (!fieldErrors.username) e.target.style.borderColor = "var(--indigo)"; }}
                />
                {fieldErrors.username ? (
                  <p style={{ fontSize: 12, color: "var(--red)", marginTop: 4, display: "flex", alignItems: "center", gap: 3 }}>⚠ {fieldErrors.username}</p>
                ) : touched.username && username ? (
                  <p style={{ fontSize: 12, color: "var(--teal)", marginTop: 4 }}>✓ Looks good</p>
                ) : null}
              </div>

              {/* Email */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: fieldErrors.email ? "var(--red)" : "var(--ink-2)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Email
                </label>
                <input
                  type="email" placeholder="you@example.com"
                  value={email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={(e) => handleBlur("email", e.target.value)}
                  style={inputStyle("email")}
                  onFocus={(e) => { if (!fieldErrors.email) e.target.style.borderColor = "var(--indigo)"; }}
                />
                {fieldErrors.email ? (
                  <p style={{ fontSize: 12, color: "var(--red)", marginTop: 4, display: "flex", alignItems: "center", gap: 3 }}>⚠ {fieldErrors.email}</p>
                ) : touched.email && email ? (
                  <p style={{ fontSize: 12, color: "var(--teal)", marginTop: 4 }}>✓ Looks good</p>
                ) : null}
              </div>

              {/* Password */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: fieldErrors.password ? "var(--red)" : "var(--ink-2)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Password
                </label>
                <input
                  type="password" placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onBlur={(e) => handleBlur("password", e.target.value)}
                  style={inputStyle("password")}
                  onFocus={(e) => { if (!fieldErrors.password) e.target.style.borderColor = "var(--indigo)"; }}
                />
                {fieldErrors.password ? (
                  <p style={{ fontSize: 12, color: "var(--red)", marginTop: 4, display: "flex", alignItems: "center", gap: 3 }}>⚠ {fieldErrors.password}</p>
                ) : null}
                {/* Strength bar */}
                {password.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6 }}>
                    {[1, 2, 3].map((lvl) => (
                      <div key={lvl} style={{
                        flex: 1, height: 3, borderRadius: 2, transition: "background 0.3s",
                        background: strength >= lvl
                          ? lvl === 1 ? "var(--red)" : lvl === 2 ? "var(--amber)" : "var(--teal)"
                          : "var(--border)",
                      }} />
                    ))}
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: strength === 1 ? "var(--red)" : strength === 2 ? "var(--amber)" : "var(--teal)" }}>
                      {strength === 1 ? "Weak" : strength === 2 ? "Fair" : "Strong"}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit" disabled={loading}
                style={{ height: 46, marginTop: 4, background: loading ? "var(--indigo-3)" : "linear-gradient(135deg, var(--coral), var(--amber))", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(240,90,79,0.3)", transition: "opacity 0.2s" }}
                className="hover:opacity-90"
              >
                {loading ? "Creating…" : "Create Account"}
              </button>
            </form>

            <p style={{ fontSize: 13, color: "var(--ink-3)", textAlign: "center", marginTop: 20 }}>
              Already have an account?{" "}
              <button onClick={() => router.push("/login")} style={{ color: "var(--indigo)", fontWeight: 700 }} className="hover:underline underline-offset-2">Login</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
