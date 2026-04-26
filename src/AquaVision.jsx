import { useState, useRef, useCallback } from "react";

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
  // Remove markdown code fences
  let cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {}
  // Try to extract JSON object
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
  safe: { color: "#00d4aa", bg: "#00d4aa15", label: "SAFE" },
  caution: { color: "#f5a623", bg: "#f5a62315", label: "CAUTION" },
  warning: { color: "#ff6b35", bg: "#ff6b3515", label: "WARNING" },
  danger: { color: "#e53e3e", bg: "#e53e3e15", label: "DANGER" },
  critical: { color: "#c0392b", bg: "#c0392b15", label: "CRITICAL" },
};

const URGENCY_LABELS = [
  "",
  "✅ All Good",
  "👁 Monitor",
  "⚡ Act Soon",
  "🚨 Act Now",
  "☠️ Emergency",
];

const URGENCY_COLORS = [
  "",
  "#00d4aa",
  "#f5a623",
  "#ff6b35",
  "#e53e3e",
  "#c0392b",
];

const SYSTEM_PROMPT = `You are AquaVision, an expert aquarist with 20+ years experience. Analyze aquarium water test strips and return ONLY valid JSON.

STRIP IDENTIFICATION:
- Tetra EasyStrips 5-in-1: 5 colored pads top to bottom: Nitrate, Nitrite, Hardness(GH), Alkalinity(KH), pH
- Tetra EasyStrips Ammonia: 1 colored pad (green tones)

COLOR TO VALUE REFERENCE:
Nitrate (top pad): cream/white=0ppm, light pink=20, pink=40, dark pink=80, red=160+
Nitrite (2nd pad): white=0, pale pink=0.5, pink=1, dark pink=3, red=5+
Hardness GH (3rd pad): yellow=0, yellow-green=25, green=75, teal=150, dark teal=300+
Alkalinity KH (4th pad): yellow=0, yellow-green=40, green=80, teal=120, dark teal=180+
pH (bottom pad): yellow=6.0, yellow-green=6.5, green=7.0, blue-green=7.5, blue=8.0, dark blue=9+
Ammonia (single pad): pale yellow=0, light green=0.25, green=0.5, mid green=1.0, dark green=3+

SAFE RANGES:
Nitrate <20ppm, Nitrite 0ppm, GH 75-150ppm, KH 80-120ppm, pH 6.8-7.8, Ammonia 0ppm

RESPONSE FORMAT (JSON only, no other text):
{"tankCount":1,"tanks":[{"tankId":"Tank 1","stripType":"5-in-1 Freshwater","parameters":[{"name":"Nitrate (NO3)","value":"40 ppm","status":"caution","emoji":"🟠","note":"Slightly elevated"}],"overallStatus":"caution","urgencyLevel":2,"summary":"Expert 2-3 sentence summary","immediateActions":["Action to take today"],"shortTermActions":["Action within a week"],"monitoringAdvice":"What to watch for"}],"crossTankInsights":"Compare tanks if multiple","expertVerdict":"Overall conclusion"}

status values: safe|caution|warning|danger|critical
urgencyLevel: 1=all-good, 2=monitor, 3=act-soon, 4=act-now, 5=emergency`;

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AquaVision() {
  const [image, setImage] = useState(null);
  const [base64, setBase64] = useState(null);
  const [mediaType, setMediaType] = useState("image/jpeg");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef();

  const handleFileLoad = useCallback((file) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, HEIC, WEBP)");
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
  }, []);

  const analyzeStrips = async () => {
    if (!base64) {
      setError("Image still loading, please wait a moment");
      return;
    }

    setAnalyzing(true);
    setError(null);
    setDebugInfo(null);

    try {
      // Call our serverless API route instead of Anthropic directly
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          system: SYSTEM_PROMPT,
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
                  text: "Analyze all test strips visible in this image. Return ONLY the JSON object with no additional text.",
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
      if (!parsed || !Array.isArray(parsed.tanks)) {
        setDebugInfo(textContent.slice(0, 500));
        throw new Error("Could not parse valid analysis from response");
      }

      parsed.tankCount = parsed.tanks.length;
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

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050d1a",
        color: "#e8f4f8",
        fontFamily: "Georgia, serif",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>

      {/* Background decoration */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #003366 0%, transparent 70%)",
            top: "-150px",
            left: "-150px",
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #004444 0%, transparent 70%)",
            bottom: "-100px",
            right: "-100px",
            opacity: 0.4,
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "860px",
          margin: "0 auto",
          padding: "32px 20px 64px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              fontSize: "48px",
              marginBottom: "10px",
              filter: "drop-shadow(0 0 20px #00aaff99)",
            }}
          >
            🐠
          </div>
          <h1
            style={{
              margin: "0 0 6px",
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: 400,
              letterSpacing: "0.18em",
              color: "#7dd3fc",
              textShadow: "0 0 40px #0088ff55",
              fontVariant: "small-caps",
            }}
          >
            AquaVision
          </h1>
          <p
            style={{
              margin: 0,
              color: "#475569",
              fontSize: "0.75rem",
              fontFamily: "'Courier New', monospace",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
            }}
          >
            AI · Aquarium Water Analysis
          </p>
          <div
            style={{
              width: "100px",
              height: "1px",
              background: "linear-gradient(90deg, transparent, #7dd3fc, transparent)",
              margin: "14px auto 0",
            }}
          />
        </div>

        {/* Upload Zone */}
        {!results && (
          <div
            onClick={() => !image && fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFileLoad(e.dataTransfer.files[0]);
            }}
            style={{
              border: `2px dashed ${
                isDragging ? "#7dd3fc" : image ? "#00d4aa55" : "#1e3a5f"
              }`,
              borderRadius: "18px",
              padding: image ? "20px" : "56px 32px",
              textAlign: "center",
              cursor: image ? "default" : "pointer",
              background: isDragging ? "#7dd3fc0a" : "#0a1929",
              transition: "all 0.25s",
              marginBottom: "20px",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.heic,.heif"
              style={{ display: "none" }}
              onChange={(e) => handleFileLoad(e.target.files[0])}
            />

            {image ? (
              <div>
                <img
                  src={image}
                  alt="Test strips"
                  style={{
                    maxHeight: "300px",
                    maxWidth: "100%",
                    borderRadius: "12px",
                    border: "1px solid #1e3a5f",
                    display: "block",
                    margin: "0 auto 20px",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={analyzeStrips}
                    disabled={analyzing || !base64}
                    style={{
                      background:
                        analyzing || !base64
                          ? "#1a2a3a"
                          : "linear-gradient(135deg, #0055cc, #00aaff)",
                      color: analyzing || !base64 ? "#475569" : "white",
                      border: "none",
                      borderRadius: "10px",
                      padding: "13px 30px",
                      fontSize: "0.95rem",
                      cursor: analyzing || !base64 ? "not-allowed" : "pointer",
                      fontFamily: "'Courier New', monospace",
                      letterSpacing: "0.08em",
                      boxShadow: analyzing ? "none" : "0 0 18px #00aaff44",
                      transition: "all 0.2s",
                    }}
                  >
                    {analyzing ? (
                      <span>
                        <span
                          style={{
                            display: "inline-block",
                            animation: "spin 0.8s linear infinite",
                            marginRight: "8px",
                          }}
                        >
                          ⟳
                        </span>
                        Analyzing…
                      </span>
                    ) : !base64 ? (
                      "⏳ Loading image…"
                    ) : (
                      "🔬 Analyze Strips"
                    )}
                  </button>
                  <button
                    onClick={reset}
                    style={{
                      background: "transparent",
                      color: "#64748b",
                      border: "1px solid #1e3a5f",
                      borderRadius: "10px",
                      padding: "13px 22px",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      fontFamily: "'Courier New', monospace",
                    }}
                  >
                    ↺ Reset
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: "2.8rem", marginBottom: "14px", opacity: 0.45 }}>
                  🧪
                </div>
                <p
                  style={{
                    color: "#7dd3fc",
                    fontSize: "1rem",
                    margin: "0 0 6px",
                    fontVariant: "small-caps",
                    letterSpacing: "0.12em",
                  }}
                >
                  Upload Test Strip Photo
                </p>
                <p
                  style={{
                    color: "#334155",
                    fontSize: "0.8rem",
                    margin: "0 0 14px",
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  Drop here or click to browse
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {["5-in-1 Strips", "Ammonia Strips", "Both Together"].map((t) => (
                    <span
                      key={t}
                      style={{
                        background: "#0f2240",
                        border: "1px solid #1e3a5f",
                        borderRadius: "20px",
                        padding: "4px 12px",
                        color: "#475569",
                        fontSize: "0.72rem",
                        fontFamily: "'Courier New', monospace",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <p
                  style={{
                    color: "#1e3a5f",
                    fontSize: "0.7rem",
                    margin: "14px 0 0",
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  JPG · PNG · HEIC · WEBP
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div
            style={{
              background: "#1a0808",
              border: "1px solid #7f1d1d",
              borderRadius: "12px",
              padding: "14px 18px",
              color: "#fca5a5",
              marginBottom: "20px",
              fontFamily: "'Courier New', monospace",
              fontSize: "0.85rem",
              lineHeight: "1.5",
            }}
          >
            <strong>⚠ Error:</strong> {error}
            {debugInfo && (
              <details open style={{ marginTop: "8px", color: "#9ca3af", fontSize: "0.75rem" }}>
                <summary style={{ cursor: "pointer", color: "#f87171", marginBottom: "4px" }}>
                  ▼ Debug Info
                </summary>
                <pre
                  style={{
                    margin: "6px 0 0",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                    maxHeight: "200px",
                    overflow: "auto",
                    background: "#0a0a0a",
                    padding: "8px",
                    borderRadius: "6px",
                  }}
                >
                  {debugInfo}
                </pre>
              </details>
            )}
            {image && !results && (
              <button
                onClick={analyzeStrips}
                disabled={analyzing}
                style={{
                  marginTop: "10px",
                  background: "#2d0a0a",
                  color: "#fca5a5",
                  border: "1px solid #7f1d1d",
                  borderRadius: "8px",
                  padding: "7px 14px",
                  fontSize: "0.76rem",
                  cursor: "pointer",
                  fontFamily: "'Courier New', monospace",
                  display: "block",
                }}
              >
                🔄 Retry Analysis
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {analyzing && (
          <div style={{ padding: "32px", textAlign: "center" }}>
            <div
              style={{
                fontSize: "2rem",
                marginBottom: "14px",
                animation: "pulse 1.4s ease-in-out infinite",
              }}
            >
              🔬
            </div>
            <div
              style={{
                height: "3px",
                borderRadius: "2px",
                marginBottom: "14px",
                background: "linear-gradient(90deg, #0a1929 0%, #0066cc 50%, #0a1929 100%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.8s infinite",
              }}
            />
            <p
              style={{
                color: "#475569",
                fontFamily: "'Courier New', monospace",
                fontSize: "0.8rem",
                letterSpacing: "0.1em",
              }}
            >
              Reading water chemistry parameters…
            </p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div style={{ animation: "fadeIn 0.5s ease-out" }}>
            {/* Results Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div
                style={{
                  background: "#0a1929",
                  border: "1px solid #1e3a5f",
                  borderRadius: "8px",
                  padding: "7px 16px",
                  fontFamily: "'Courier New', monospace",
                  fontSize: "0.82rem",
                  color: "#7dd3fc",
                }}
              >
                🐠 {results.tankCount} strip{results.tankCount !== 1 ? "s" : ""} analyzed
              </div>
              <button
                onClick={reset}
                style={{
                  background: "transparent",
                  color: "#64748b",
                  border: "1px solid #1e3a5f",
                  borderRadius: "8px",
                  padding: "7px 16px",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  fontFamily: "'Courier New', monospace",
                }}
              >
                ↺ New Analysis
              </button>
            </div>

            {/* Tank Cards */}
            {results.tanks.map((tank, tankIndex) => {
              const urgencyColor = URGENCY_COLORS[tank.urgencyLevel] || "#7dd3fc";
              return (
                <div
                  key={tankIndex}
                  style={{
                    background: "#0a1929",
                    border: `1px solid ${urgencyColor}55`,
                    borderRadius: "16px",
                    padding: "22px",
                    marginBottom: "18px",
                    boxShadow: `0 0 28px ${urgencyColor}0d`,
                  }}
                >
                  {/* Tank Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "18px",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <h2
                        style={{
                          margin: "0 0 3px",
                          color: "#e2e8f0",
                          fontSize: "1.2rem",
                          fontWeight: 400,
                          letterSpacing: "0.06em",
                        }}
                      >
                        {tank.tankId}
                      </h2>
                      <p
                        style={{
                          margin: 0,
                          color: "#475569",
                          fontSize: "0.75rem",
                          fontFamily: "'Courier New', monospace",
                        }}
                      >
                        {tank.stripType}
                      </p>
                    </div>
                    <span
                      style={{
                        background: urgencyColor + "22",
                        border: `1px solid ${urgencyColor}`,
                        borderRadius: "8px",
                        padding: "5px 14px",
                        color: urgencyColor,
                        fontSize: "0.8rem",
                        fontFamily: "'Courier New', monospace",
                        letterSpacing: "0.05em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {URGENCY_LABELS[tank.urgencyLevel] || "Unknown"}
                    </span>
                  </div>

                  {/* Parameters Grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                      gap: "10px",
                      marginBottom: "18px",
                    }}
                  >
                    {(tank.parameters || []).map((param, paramIndex) => {
                      const statusConfig = STATUS_CONFIG[param.status] || STATUS_CONFIG.caution;
                      return (
                        <div
                          key={paramIndex}
                          style={{
                            background: statusConfig.bg,
                            border: `1px solid ${statusConfig.color}44`,
                            borderRadius: "10px",
                            padding: "12px 10px",
                            textAlign: "center",
                          }}
                        >
                          <div style={{ fontSize: "1.1rem", marginBottom: "3px" }}>
                            {param.emoji}
                          </div>
                          <div
                            style={{
                              color: "#64748b",
                              fontSize: "0.65rem",
                              fontFamily: "'Courier New', monospace",
                              marginBottom: "4px",
                              letterSpacing: "0.04em",
                            }}
                          >
                            {param.name}
                          </div>
                          <div
                            style={{
                              color: statusConfig.color,
                              fontSize: "1rem",
                              fontWeight: 700,
                              marginBottom: "2px",
                            }}
                          >
                            {param.value}
                          </div>
                          <div
                            style={{
                              display: "inline-block",
                              background: statusConfig.color + "22",
                              color: statusConfig.color,
                              fontSize: "0.58rem",
                              fontFamily: "'Courier New', monospace",
                              padding: "1px 6px",
                              borderRadius: "4px",
                              letterSpacing: "0.08em",
                              marginBottom: "4px",
                            }}
                          >
                            {statusConfig.label}
                          </div>
                          <div
                            style={{
                              color: "#475569",
                              fontSize: "0.63rem",
                              fontFamily: "'Courier New', monospace",
                              lineHeight: "1.3",
                            }}
                          >
                            {param.note}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary */}
                  <div
                    style={{
                      background: "#060f1e",
                      borderLeft: `3px solid ${urgencyColor}`,
                      borderRadius: "0 8px 8px 0",
                      padding: "14px 16px",
                      marginBottom: "14px",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        color: "#cbd5e1",
                        fontSize: "0.88rem",
                        lineHeight: "1.65",
                        fontStyle: "italic",
                      }}
                    >
                      {tank.summary}
                    </p>
                  </div>

                  {/* Immediate Actions */}
                  {tank.immediateActions?.length > 0 && (
                    <div style={{ marginBottom: "12px" }}>
                      <p
                        style={{
                          color: "#e53e3e",
                          fontSize: "0.7rem",
                          fontFamily: "'Courier New', monospace",
                          letterSpacing: "0.15em",
                          margin: "0 0 8px",
                          textTransform: "uppercase",
                        }}
                      >
                        ⚡ Immediate Actions
                      </p>
                      {tank.immediateActions.map((action, actionIndex) => (
                        <div
                          key={actionIndex}
                          style={{
                            display: "flex",
                            gap: "8px",
                            padding: "7px 0",
                            borderBottom: "1px solid #0f2240",
                            color: "#fca5a5",
                            fontSize: "0.85rem",
                          }}
                        >
                          <span style={{ color: "#e53e3e", flexShrink: 0 }}>→</span>
                          {action}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Short Term Actions */}
                  {tank.shortTermActions?.length > 0 && (
                    <div style={{ marginBottom: "12px" }}>
                      <p
                        style={{
                          color: "#f5a623",
                          fontSize: "0.7rem",
                          fontFamily: "'Courier New', monospace",
                          letterSpacing: "0.15em",
                          margin: "0 0 8px",
                          textTransform: "uppercase",
                        }}
                      >
                        📋 Short-Term Actions
                      </p>
                      {tank.shortTermActions.map((action, actionIndex) => (
                        <div
                          key={actionIndex}
                          style={{
                            display: "flex",
                            gap: "8px",
                            padding: "7px 0",
                            borderBottom: "1px solid #0f2240",
                            color: "#fde68a",
                            fontSize: "0.85rem",
                          }}
                        >
                          <span style={{ color: "#f5a623", flexShrink: 0 }}>→</span>
                          {action}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Monitoring Advice */}
                  {tank.monitoringAdvice && (
                    <div
                      style={{
                        background: "#00d4aa0a",
                        border: "1px solid #00d4aa22",
                        borderRadius: "8px",
                        padding: "11px 14px",
                        marginTop: "10px",
                      }}
                    >
                      <p
                        style={{
                          color: "#6ee7b7",
                          fontSize: "0.8rem",
                          margin: 0,
                          fontFamily: "'Courier New', monospace",
                          lineHeight: "1.5",
                        }}
                      >
                        👁 {tank.monitoringAdvice}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Cross-Tank Insights */}
            {results.crossTankInsights && (
              <div
                style={{
                  background: "#0a1929",
                  border: "1px solid #1e3a5f",
                  borderRadius: "14px",
                  padding: "20px",
                  marginBottom: "16px",
                }}
              >
                <p
                  style={{
                    color: "#7dd3fc",
                    fontSize: "0.7rem",
                    fontFamily: "'Courier New', monospace",
                    letterSpacing: "0.2em",
                    margin: "0 0 10px",
                    textTransform: "uppercase",
                  }}
                >
                  🔭 Cross-Tank Insights
                </p>
                <p style={{ color: "#cbd5e1", fontSize: "0.88rem", lineHeight: "1.7", margin: 0 }}>
                  {results.crossTankInsights}
                </p>
              </div>
            )}

            {/* Expert Verdict */}
            {results.expertVerdict && (
              <div
                style={{
                  background: "linear-gradient(135deg, #0a1929, #061524)",
                  border: "1px solid #0066cc44",
                  borderRadius: "14px",
                  padding: "20px",
                  marginBottom: "20px",
                  boxShadow: "0 0 30px #0066cc0d",
                }}
              >
                <p
                  style={{
                    color: "#7dd3fc",
                    fontSize: "0.7rem",
                    fontFamily: "'Courier New', monospace",
                    letterSpacing: "0.2em",
                    margin: "0 0 10px",
                    textTransform: "uppercase",
                  }}
                >
                  🎓 Expert Verdict
                </p>
                <p
                  style={{
                    color: "#e2e8f0",
                    fontSize: "0.92rem",
                    lineHeight: "1.7",
                    margin: 0,
                    fontStyle: "italic",
                  }}
                >
                  {results.expertVerdict}
                </p>
              </div>
            )}

            {/* Source Image Thumbnail */}
            {image && (
              <div style={{ textAlign: "center", opacity: 0.5, marginTop: "8px" }}>
                <img
                  src={image}
                  alt="Source"
                  style={{
                    maxHeight: "120px",
                    maxWidth: "100%",
                    borderRadius: "8px",
                    border: "1px solid #1e3a5f",
                  }}
                />
                <p
                  style={{
                    color: "#1e3a5f",
                    fontSize: "0.65rem",
                    fontFamily: "'Courier New', monospace",
                    marginTop: "6px",
                  }}
                >
                  analyzed image
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: "40px",
            color: "#1e3a5f",
            fontSize: "0.65rem",
            fontFamily: "'Courier New', monospace",
            letterSpacing: "0.12em",
            lineHeight: "1.8",
          }}
        >
          AQUAVISION · AI WATER CHEMISTRY · POWERED BY CLAUDE
          <br />
          <span style={{ color: "#0f2240" }}>
            Estimates only — verify critical readings with liquid test kits
          </span>
        </div>
      </div>
    </div>
  );
}
