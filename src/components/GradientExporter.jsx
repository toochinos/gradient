import { useState, useEffect } from "react";
import { generateWrapper, makeBlobUrl, downloadString } from "../utils/wrapper";

export default function GradientExporter({ cssString }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [format, setFormat] = useState("html"); // or 'react'

  useEffect(() => {
    if (!cssString) return;
    const wrapped = generateWrapper(cssString, format);
    const url = makeBlobUrl(wrapped, format === "react" ? "text/javascript" : "text/html");
    setPreviewUrl(url);
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [cssString, format]);

  const onDownload = () => {
    const wrapped = generateWrapper(cssString, format);
    const filename = format === "react" ? "MeshGradient.jsx" : "gradient-export.html";
    const mime = format === "react" ? "text/javascript" : "text/html";
    downloadString(filename, wrapped, mime);
  };

  const onCopy = async () => {
    const wrapped = generateWrapper(cssString, format);
    await navigator.clipboard.writeText(wrapped);
    alert("Code copied to clipboard");
  };

  return (
    <div style={{ display: "grid", gap: 12, color: "#374151" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 4, color: "#374151" }}>
          <input type="radio" checked={format === "html"} onChange={() => setFormat("html")} /> HTML
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 4, color: "#374151" }}>
          <input type="radio" checked={format === "react"} onChange={() => setFormat("react")} /> React (styled-jsx)
        </label>
        <button
          onClick={onDownload}
          style={{
            padding: "8px 16px",
            backgroundColor: "#374151",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Download
        </button>
        <button
          onClick={onCopy}
          style={{
            padding: "8px 16px",
            backgroundColor: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Copy
        </button>
      </div>

      <div style={{ height: 420, border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
        {previewUrl ? (
          <iframe title="preview" src={previewUrl} style={{ width: "100%", height: "100%", border: 0 }} />
        ) : (
          <div style={{ padding: 20, color: "#6b7280" }}>No preview yet</div>
        )}
      </div>
    </div>
  );
}