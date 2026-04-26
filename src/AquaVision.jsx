import { useState, useRef, useCallback } from "react";
import { getTranslation } from "./translations";
import { getSystemPrompt, getUserPrompt } from "./prompts";
import { exportToText, exportToJSON } from "./exportUtils";

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function getMediaType(file) {
  const type = (file.type || "").toLowerCase();
  if (type === "image/png") return "image/png";
  if (type === "image/webp") return "image/webp";
  if (type === "image/gif") return "image/gif";
  return "image/jpeg";
}

function extractJSON(raw) {
  if (!raw) return null;
  let cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {}
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {}
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const STATUS_CONFIG = {
  safe: { color: "#00d4aa", bg: "#00d4aa15", labelKey: "statusSafe" },
  caution: { color: "#f5a623", bg: "#f5a62315", labelKey: "statusCaution" },
  warning: { color: "#ff6b35", bg: "#ff6b3515", labelKey: "statusWarning" },
  danger: { color: "#e53e3e", bg: "#e53e3e15", labelKey: "statusDanger" },
  critical: { color: "#c0392b", bg: "#c0392b15", labelKey: "statusCritical" },
};

const URGENCY_LABELS_KEYS = [
  "",
  "urgencyAllGood",
  "urgencyMonitor", 
  "urgencyActSoon",
  "urgencyActNow",
  "urgencyEmergency",
];

const URGENCY_COLORS = [
  "",
  "#00d4aa",
  "#f5a623",
  "#ff6b35",
  "#e53e3e",
  "#c0392b",
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT  
// ═══════════════════════════════════════════════════════════════════════════

export default function AquaVision() {
  const [language, setLanguage] = useState("en"); // "en" or "es"
  const [mode, setMode] = useState("strips"); // "strips" or "tank"
  const [image, setImage] = useState(null);
  const [base64, setBase64] = useState(null);
  const [mediaType, setMediaType] = useState("image/jpeg");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef();
  
  const t = (key) => getTranslation(language, key);

  const handleFileLoad = useCallback((file) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      setError(t("uploadError"));
      return;
    }

    setError(null);
    setDebugInfo(null);
    setResults(null);
    setImage(URL.createObjectURL(file));
    setMediaType(getMediaType(file));

    const reader = new FileReader();
    reader.onload = (e) => setBase64(e.target.result.split(",")[1]);
    reader.onerror = () => setError("Failed to read image file");
    reader.readAsDataURL(file);
  }, [language]);

  const analyzeImage = async () => {
    if (!base64) {
      setError(t("loadingError"));
      return;
    }

    setAnalyzing(true);
    setError(null);
    setDebugInfo(null);

    try {
      const systemPrompt = getSystemPrompt(mode, language);
      const userPrompt = getUserPrompt(mode, language);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: mediaType,
                    data: base64,
                  },
                },
                {
                  type: "text",
                  text: userPrompt,
                },
              ],
            },
          ],
        }),
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        setDebugInfo(responseText.slice(0, 500));
        throw new Error("API returned invalid JSON. See debug info below.");
      }

      if (!response.ok || data.error) {
        setDebugInfo(JSON.stringify(data, null, 2));
        throw new Error(
          data?.error?.message || `API error: ${response.status}`
        );
      }

      const textContent = data.content?.find((b) => b.type === "text")?.text;
      if (!textContent) {
        setDebugInfo(JSON.stringify(data, null, 2));
        throw new Error("No text content in API response");
      }

      const parsed = extractJSON(textContent);
      if (!parsed) {
        setDebugInfo(textContent.slice(0, 500));
        throw new Error("Could not parse valid analysis from response");
      }

      if (mode === "strips" && parsed.tanks) {
        parsed.tankCount = parsed.tanks.length;
      }

      setResults(parsed);
      setDebugInfo(null);
    } catch (err) {
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setBase64(null);
    setResults(null);
    setError(null);
    setDebugInfo(null);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    reset();
  };

  const handleExport = () => {
    try {
      exportToText(results, mode, language, t);
      // Success message shown by browser download
    } catch (err) {
      console.error("Export error:", err);
      alert(t("exportError"));
    }
  };

  // Simple minimal render for testing
  return (
    <div style={{ minHeight: "100vh", background: "#050d1a", color: "#e8f4f8", padding: "20px", fontFamily: "Georgia, serif" }}>
      {/* Language Toggle - ALWAYS VISIBLE */}
      <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 1000 }}>
        <button
          onClick={() => setLanguage(language === "en" ? "es" : "en")}
          style={{
            background: "linear-gradient(135deg, #0055cc, #00aaff)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            fontSize: "1rem",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(0,170,255,0.4)",
          }}
        >
          {language === "en" ? "🇪🇸 Español" : "🇬🇧 English"}
        </button>
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "30px", marginTop: "60px" }}>
        <h1 style={{ fontSize: "3rem", margin: "0", color: "#7dd3fc" }}>{t("appName")}</h1>
        <p style={{ color: "#475569", fontSize: "0.9rem" }}>{t("appSubtitle")}</p>
      </div>

      {/* Mode Selector */}
      {!results && (
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "24px" }}>
          <button
            onClick={() => switchMode("strips")}
            style={{
              background: mode === "strips" ? "linear-gradient(135deg, #0055cc, #00aaff)" : "#1a2a3a",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              cursor: "pointer",
            }}
          >
            {t("modeStrips")}
          </button>
          <button
            onClick={() => switchMode("tank")}
            style={{
              background: mode === "tank" ? "linear-gradient(135deg, #0055cc, #00aaff)" : "#1a2a3a",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              cursor: "pointer",
            }}
          >
            {t("modeTank")}
          </button>
        </div>
      )}

      {/* Upload Zone */}
      {!results && (
        <div
          onClick={() => !image && fileInputRef.current?.click()}
          style={{
            border: "2px dashed #1e3a5f",
            borderRadius: "12px",
            padding: image ? "20px" : "60px",
            textAlign: "center",
            cursor: image ? "default" : "pointer",
            background: "#0a1929",
            marginBottom: "20px",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleFileLoad(e.target.files[0])}
          />

          {image ? (
            <div>
              <img
                src={image}
                alt="Upload"
                style={{
                  maxHeight: "300px",
                  maxWidth: "100%",
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}
              />
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button
                  onClick={analyzeImage}
                  disabled={analyzing || !base64}
                  style={{
                    background: analyzing ? "#1a2a3a" : "linear-gradient(135deg, #0055cc, #00aaff)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "12px 24px",
                    cursor: analyzing ? "not-allowed" : "pointer",
                  }}
                >
                  {analyzing ? t("analyzing") : (mode === "strips" ? t("analyzeStrips") : t("analyzeTank"))}
                </button>
                <button
                  onClick={reset}
                  style={{
                    background: "#1a2a3a",
                    color: "#64748b",
                    border: "1px solid #1e3a5f",
                    borderRadius: "8px",
                    padding: "12px 24px",
                    cursor: "pointer",
                  }}
                >
                  {t("reset")}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: "3rem", marginBottom: "10px" }}>
                {mode === "strips" ? "🧪" : "📸"}
              </div>
              <p style={{ fontSize: "1.2rem", color: "#7dd3fc" }}>
                {mode === "strips" ? t("uploadStripTitle") : t("uploadTankTitle")}
              </p>
              <p style={{ color: "#334155", fontSize: "0.9rem" }}>{t("uploadInstruction")}</p>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{ background: "#1a0808", border: "1px solid #7f1d1d", borderRadius: "8px", padding: "12px", color: "#fca5a5", marginBottom: "20px" }}>
          <strong>{t("errorTitle")}</strong> {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <div>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "20px" }}>
            <button onClick={reset} style={{ background: "#1a2a3a", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", cursor: "pointer" }}>
              {t("newAnalysis")}
            </button>
            <button onClick={handleExport} style={{ background: "linear-gradient(135deg, #0055cc, #00aaff)", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", cursor: "pointer" }}>
              {t("export")}
            </button>
          </div>
          <div style={{ background: "#0a1929", borderRadius: "12px", padding: "20px", color: "#cbd5e1" }}>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "40px", color: "#1e3a5f", fontSize: "0.7rem" }}>
        {t("footerText")}
      </div>
    </div>
  );
}
