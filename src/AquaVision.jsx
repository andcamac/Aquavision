import { useState, useRef, useCallback } from "react";
import { getTranslation } from "./translations";
import { getSystemPrompt, getUserPrompt } from "./prompts";
import { exportToText, exportToJSON } from "./exportUtils";
import WelcomeGuide from "./WelcomeGuide";

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
  const [showWelcome, setShowWelcome] = useState(false);
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

      {/* Results - Tank Health Check */}
      {results && mode === "tank" && (
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "20px", flexWrap: "wrap" }}>
            <button onClick={reset} style={{ background: "#1a2a3a", color: "#64748b", border: "1px solid #1e3a5f", borderRadius: "8px", padding: "10px 20px", cursor: "pointer" }}>
              {t("newAnalysis")}
            </button>
            <button onClick={handleExport} style={{ background: "linear-gradient(135deg, #0055cc, #00aaff)", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", cursor: "pointer", boxShadow: "0 0 18px #00aaff44" }}>
              {t("export")}
            </button>
          </div>

          {/* Overall Status Card */}
          <div style={{ 
            background: "#0a1929", 
            border: `1px solid ${URGENCY_COLORS[results.urgencyLevel] || "#7dd3fc"}55`,
            borderRadius: "16px", 
            padding: "22px", 
            marginBottom: "18px",
            boxShadow: `0 0 28px ${URGENCY_COLORS[results.urgencyLevel] || "#7dd3fc"}0d`
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
              <h2 style={{ margin: 0, color: "#e2e8f0", fontSize: "1.3rem" }}>{t("tankHealthStatus")}</h2>
              <span style={{
                background: (URGENCY_COLORS[results.urgencyLevel] || "#7dd3fc") + "22",
                border: `1px solid ${URGENCY_COLORS[results.urgencyLevel] || "#7dd3fc"}`,
                borderRadius: "8px",
                padding: "6px 16px",
                color: URGENCY_COLORS[results.urgencyLevel] || "#7dd3fc",
                fontSize: "0.85rem",
                fontFamily: "'Courier New', monospace",
                fontWeight: "bold",
              }}>
                {t(URGENCY_LABELS_KEYS[results.urgencyLevel] || "urgencyMonitor")}
              </span>
            </div>

            {/* Health Parameters Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px", marginBottom: "20px" }}>
              {[
                { key: "waterClarity", label: t("waterClarity") },
                { key: "algaePresence", label: t("algaePresence") },
                { key: "fishHealth", label: t("fishHealth") },
                { key: "plantHealth", label: t("plantHealth") },
                { key: "substrateCondition", label: t("substrateCondition") },
                { key: "equipmentStatus", label: t("equipmentStatus") },
              ].map(({ key, label }) => {
                if (!results[key]) return null;
                const param = results[key];
                const statusConfig = STATUS_CONFIG[param.status] || STATUS_CONFIG.caution;
                return (
                  <div
                    key={key}
                    style={{
                      background: statusConfig.bg,
                      border: `1px solid ${statusConfig.color}44`,
                      borderRadius: "10px",
                      padding: "14px 12px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "1.4rem", marginBottom: "6px" }}>{param.emoji || "•"}</div>
                    <div style={{ color: "#64748b", fontSize: "0.7rem", fontFamily: "'Courier New', monospace", marginBottom: "6px", letterSpacing: "0.05em" }}>
                      {label}
                    </div>
                    <div style={{
                      display: "inline-block",
                      background: statusConfig.color + "22",
                      color: statusConfig.color,
                      fontSize: "0.6rem",
                      fontFamily: "'Courier New', monospace",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      letterSpacing: "0.08em",
                      marginBottom: "8px",
                      fontWeight: "bold",
                    }}>
                      {t(statusConfig.labelKey)}
                    </div>
                    <div style={{ color: "#cbd5e1", fontSize: "0.75rem", lineHeight: "1.4" }}>
                      {param.observation}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            {results.summary && (
              <div style={{
                background: "#060f1e",
                borderLeft: `3px solid ${URGENCY_COLORS[results.urgencyLevel] || "#7dd3fc"}`,
                borderRadius: "0 8px 8px 0",
                padding: "16px 18px",
                marginBottom: "16px",
              }}>
                <p style={{ margin: 0, color: "#e2e8f0", fontSize: "0.95rem", lineHeight: "1.7", fontStyle: "italic" }}>
                  {results.summary}
                </p>
              </div>
            )}

            {/* Immediate Actions */}
            {results.immediateActions && results.immediateActions.length > 0 && (
              <div style={{ marginBottom: "14px" }}>
                <p style={{ color: "#e53e3e", fontSize: "0.75rem", fontFamily: "'Courier New', monospace", letterSpacing: "0.15em", margin: "0 0 10px", textTransform: "uppercase", fontWeight: "bold" }}>
                  {t("immediateActions")}
                </p>
                {results.immediateActions.map((action, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      gap: "10px",
                      padding: "10px 12px",
                      marginBottom: "6px",
                      background: "#1a0808",
                      border: "1px solid #7f1d1d",
                      borderRadius: "8px",
                      color: "#fca5a5",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span style={{ color: "#e53e3e", flexShrink: 0, fontWeight: "bold" }}>→</span>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Maintenance Recommendations */}
            {results.maintenanceRecommendations && results.maintenanceRecommendations.length > 0 && (
              <div style={{ marginBottom: "14px" }}>
                <p style={{ color: "#f5a623", fontSize: "0.75rem", fontFamily: "'Courier New', monospace", letterSpacing: "0.15em", margin: "0 0 10px", textTransform: "uppercase", fontWeight: "bold" }}>
                  {t("maintenanceSchedule")}
                </p>
                {results.maintenanceRecommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      gap: "10px",
                      padding: "10px 12px",
                      marginBottom: "6px",
                      background: "#1a1408",
                      border: "1px solid #78350f",
                      borderRadius: "8px",
                      color: "#fde68a",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span style={{ color: "#f5a623", flexShrink: 0, fontWeight: "bold" }}>→</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            )}

            {/* When to Test Water */}
            {results.whenToTestWater && (
              <div style={{
                background: "#00d4aa0a",
                border: "1px solid #00d4aa22",
                borderRadius: "8px",
                padding: "12px 16px",
                marginTop: "12px",
              }}>
                <p style={{ color: "#6ee7b7", fontSize: "0.85rem", margin: 0, fontFamily: "'Courier New', monospace", lineHeight: "1.5" }}>
                  <strong>{t("whenToTestWater")}</strong> {results.whenToTestWater}
                </p>
              </div>
            )}
          </div>

          {/* Expert Verdict */}
          {results.expertVerdict && (
            <div style={{
              background: "linear-gradient(135deg, #0a1929, #061524)",
              border: "1px solid #0066cc44",
              borderRadius: "14px",
              padding: "20px",
              marginBottom: "20px",
              boxShadow: "0 0 30px #0066cc0d",
            }}>
              <p style={{ color: "#7dd3fc", fontSize: "0.75rem", fontFamily: "'Courier New', monospace", letterSpacing: "0.2em", margin: "0 0 12px", textTransform: "uppercase" }}>
                {t("expertVerdict")}
              </p>
              <p style={{ color: "#e2e8f0", fontSize: "1rem", lineHeight: "1.7", margin: 0, fontStyle: "italic" }}>
                {results.expertVerdict}
              </p>
            </div>
          )}

          {/* Source Image */}
          {image && (
            <div style={{ textAlign: "center", opacity: 0.5, marginTop: "12px" }}>
              <img
                src={image}
                alt="Analyzed tank"
                style={{
                  maxHeight: "120px",
                  maxWidth: "100%",
                  borderRadius: "8px",
                  border: "1px solid #1e3a5f",
                }}
              />
              <p style={{ color: "#1e3a5f", fontSize: "0.7rem", fontFamily: "'Courier New', monospace", marginTop: "6px" }}>
                {t("analyzedTankPhoto")}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Welcome Guide Modal */}
      {showWelcome && (
        <WelcomeGuide 
          onClose={() => setShowWelcome(false)} 
          language={language}
        />
      )}

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "40px", color: "#1e3a5f", fontSize: "0.7rem" }}>
        {t("footerText")}
      </div>
    </div>
  );
}
