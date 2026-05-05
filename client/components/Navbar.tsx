"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("token"));
    setUsername(localStorage.getItem("username") || "");
    setIsAdmin(localStorage.getItem("isAdmin") === "true");
  }, [pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("isAdmin");
    setLoggedIn(false);
    setUsername("");
    setIsAdmin(false);
    router.push("/");
  };

  return (
    <nav style={{
      background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
      position: "sticky", top: 0, zIndex: 50,
      boxShadow: "0 1px 12px rgba(79,53,210,0.06)",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        {/* Logo */}
        <button
          onClick={() => router.push("/")}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg, var(--indigo), var(--indigo-3))",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 14,
          }}>B</div>
          <span style={{ fontWeight: 700, fontSize: 17, color: "var(--indigo)", letterSpacing: "-0.02em" }}>
            Blogify
          </span>
        </button>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {loggedIn ? (
            <>
              <button
                onClick={() => router.push("/create")}
                style={{
                  background: "linear-gradient(135deg, var(--indigo), var(--indigo-2))",
                  color: "#fff", fontSize: 13, fontWeight: 600,
                  padding: "7px 18px", borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(79,53,210,0.25)",
                }}
                className="hover:opacity-90 transition-opacity"
              >
                + Write
              </button>
              {isAdmin && (
                <button
                  onClick={() => router.push("/admin")}
                  style={{
                    color: "#fff", fontSize: 13, fontWeight: 600,
                    padding: "7px 14px", borderRadius: 8,
                    background: "linear-gradient(135deg, var(--coral), var(--amber))",
                    boxShadow: "0 2px 8px rgba(240,90,79,0.25)",
                  }}
                  className="hover:opacity-90 transition-opacity"
                >
                  ⚙ Admin
                </button>
              )}
              {/* Profile avatar button */}
              <button
                onClick={() => router.push("/profile")}
                title={`@${username} — My Profile`}
                style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--indigo), var(--indigo-3))",
                  color: "#fff", fontSize: 14, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "2px solid var(--indigo-border)",
                  cursor: "pointer", flexShrink: 0,
                }}
                className="hover:opacity-80 transition-opacity"
              >
                {username[0]?.toUpperCase() || "U"}
              </button>
              <button
                onClick={logout}
                style={{ color: "var(--ink-3)", fontSize: 13, padding: "7px 12px", borderRadius: 8 }}
                className="hover:bg-[var(--bg-2)] transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push("/login")}
                style={{ color: "var(--ink-2)", fontSize: 13, fontWeight: 500, padding: "7px 14px", borderRadius: 8 }}
                className="hover:bg-[var(--bg-2)] transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => router.push("/register")}
                style={{
                  background: "linear-gradient(135deg, var(--indigo), var(--indigo-2))",
                  color: "#fff", fontSize: 13, fontWeight: 600,
                  padding: "7px 18px", borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(79,53,210,0.25)",
                }}
                className="hover:opacity-90 transition-opacity"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
