import React from "react";

export default function NotFound() {
  return (
    <main style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h1 style={{ fontSize: "2rem", color: "#e11d48", marginBottom: "1rem" }}>404 - الصفحة غير موجودة</h1>
      <p style={{ color: "#666" }}>عذراً، الصفحة التي تبحث عنها غير متوفرة.</p>
    </main>
  );
}
