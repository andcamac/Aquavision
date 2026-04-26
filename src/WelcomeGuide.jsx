// Welcome and Help Guide Component for AquaVision
import React from 'react';

export default function WelcomeGuide({ onClose, language = "en" }) {
  const content = {
    en: {
      title: "Welcome to AquaVision",
      subtitle: "AI-Powered Aquarium Water Analysis",
      quickStart: "Quick Start Guide",
      features: "Features",
      howItWorks: "How It Works",
      getStarted: "Get Started",
      
      modes: {
        title: "Two Analysis Modes",
        strips: {
          title: "🧪 Test Strips Analysis",
          desc: "Upload photos of Tetra EasyStrips for precise chemical readings",
          features: [
            "Nitrate, Nitrite, GH, KH, pH, Ammonia",
            "Color-coded safety status",
            "Immediate & short-term action plans",
            "Multi-tank support"
          ]
        },
        tank: {
          title: "📸 Tank Health Check",
          desc: "Upload tank photos for visual condition assessment",
          features: [
            "Water clarity analysis",
            "Algae detection & identification",
            "Fish health observation",
            "Plant condition assessment",
            "Substrate & equipment check"
          ]
        }
      },
      
      steps: {
        title: "How to Use",
        items: [
          "Switch language (EN/ES) in top-right corner if needed",
          "Choose your mode: Test Strips or Tank Health",
          "Upload a clear photo (JPG, PNG, HEIC, WEBP)",
          "Click 'Analyze' and wait ~5 seconds",
          "Review color-coded results and recommendations",
          "Export your analysis to save or share"
        ]
      },
      
      tips: {
        title: "Pro Tips",
        items: [
          "📷 Take photos in good lighting for best results",
          "🧪 For strips: Wait 60 seconds before photographing",
          "📸 For tanks: Include full tank view when possible",
          "💾 Export results to track changes over time",
          "🔄 Use Tank Health weekly, Test Strips monthly",
          "🌍 Switch to Spanish for Latin American users"
        ]
      },
      
      support: {
        title: "Supported Test Strips",
        items: [
          "Tetra EasyStrips 5-in-1 (Nitrate, Nitrite, GH, KH, pH)",
          "Tetra EasyStrips Ammonia",
          "Multiple strips in one photo",
          "Multiple tanks analysis"
        ]
      },
      
      privacy: {
        title: "Privacy & Safety",
        items: [
          "✅ Photos processed securely via AI",
          "✅ No data stored or shared",
          "✅ Results available for export",
          "✅ 100% free to use"
        ]
      }
    },
    
    es: {
      title: "Bienvenido a AquaVision",
      subtitle: "Análisis de Agua de Acuario con IA",
      quickStart: "Guía Rápida",
      features: "Características",
      howItWorks: "Cómo Funciona",
      getStarted: "Comenzar",
      
      modes: {
        title: "Dos Modos de Análisis",
        strips: {
          title: "🧪 Análisis de Tiras Reactivas",
          desc: "Sube fotos de Tetra EasyStrips para lecturas químicas precisas",
          features: [
            "Nitrato, Nitrito, GH, KH, pH, Amoníaco",
            "Estado de seguridad con código de colores",
            "Planes de acción inmediatos y a corto plazo",
            "Soporte para múltiples acuarios"
          ]
        },
        tank: {
          title: "📸 Revisión de Salud del Acuario",
          desc: "Sube fotos del acuario para evaluación visual",
          features: [
            "Análisis de claridad del agua",
            "Detección e identificación de algas",
            "Observación de salud de peces",
            "Evaluación de condición de plantas",
            "Revisión de sustrato y equipamiento"
          ]
        }
      },
      
      steps: {
        title: "Cómo Usar",
        items: [
          "Cambia el idioma (EN/ES) en la esquina superior derecha si lo necesitas",
          "Elige tu modo: Tiras Reactivas o Salud del Acuario",
          "Sube una foto clara (JPG, PNG, HEIC, WEBP)",
          "Haz clic en 'Analizar' y espera ~5 segundos",
          "Revisa resultados con código de colores y recomendaciones",
          "Exporta tu análisis para guardar o compartir"
        ]
      },
      
      tips: {
        title: "Consejos Pro",
        items: [
          "📷 Toma fotos con buena iluminación para mejores resultados",
          "🧪 Para tiras: Espera 60 segundos antes de fotografiar",
          "📸 Para acuarios: Incluye vista completa cuando sea posible",
          "💾 Exporta resultados para seguir cambios a lo largo del tiempo",
          "🔄 Usa Salud del Acuario semanalmente, Tiras mensualmente",
          "🌍 Cambia a español para usuarios latinoamericanos"
        ]
      },
      
      support: {
        title: "Tiras Reactivas Soportadas",
        items: [
          "Tetra EasyStrips 5 en 1 (Nitrato, Nitrito, GH, KH, pH)",
          "Tetra EasyStrips Amoníaco",
          "Múltiples tiras en una foto",
          "Análisis de múltiples acuarios"
        ]
      },
      
      privacy: {
        title: "Privacidad y Seguridad",
        items: [
          "✅ Fotos procesadas de forma segura con IA",
          "✅ No se almacenan ni comparten datos",
          "✅ Resultados disponibles para exportar",
          "✅ 100% gratis para usar"
        ]
      }
    }
  };
  
  const t = content[language] || content.en;
  
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(5, 13, 26, 0.95)",
      zIndex: 9999,
      overflow: "auto",
      padding: "20px",
    }}>
      <div style={{
        maxWidth: "900px",
        margin: "0 auto",
        background: "#0a1929",
        borderRadius: "16px",
        padding: "30px",
        border: "1px solid #1e3a5f",
        position: "relative",
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "transparent",
            color: "#64748b",
            border: "1px solid #1e3a5f",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          ✕ {language === "es" ? "Cerrar" : "Close"}
        </button>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "10px" }}>🐠</div>
          <h1 style={{ 
            margin: "0 0 8px", 
            fontSize: "2.5rem", 
            color: "#7dd3fc",
            letterSpacing: "0.15em",
            fontVariant: "small-caps"
          }}>
            {t.title}
          </h1>
          <p style={{ color: "#64748b", fontSize: "1.1rem", margin: 0 }}>
            {t.subtitle}
          </p>
        </div>
        
        {/* Two Modes */}
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ color: "#7dd3fc", fontSize: "1.5rem", marginBottom: "20px", textAlign: "center" }}>
            {t.modes.title}
          </h2>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
            gap: "20px" 
          }}>
            {/* Test Strips Mode */}
            <div style={{
              background: "#060f1e",
              border: "1px solid #0066cc44",
              borderRadius: "12px",
              padding: "20px",
            }}>
              <h3 style={{ color: "#00aaff", fontSize: "1.2rem", marginBottom: "10px" }}>
                {t.modes.strips.title}
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "15px" }}>
                {t.modes.strips.desc}
              </p>
              <ul style={{ color: "#cbd5e1", fontSize: "0.85rem", lineHeight: "1.8", paddingLeft: "20px" }}>
                {t.modes.strips.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>
            
            {/* Tank Health Mode */}
            <div style={{
              background: "#060f1e",
              border: "1px solid #00d4aa44",
              borderRadius: "12px",
              padding: "20px",
            }}>
              <h3 style={{ color: "#00d4aa", fontSize: "1.2rem", marginBottom: "10px" }}>
                {t.modes.tank.title}
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "15px" }}>
                {t.modes.tank.desc}
              </p>
              <ul style={{ color: "#cbd5e1", fontSize: "0.85rem", lineHeight: "1.8", paddingLeft: "20px" }}>
                {t.modes.tank.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* How to Use */}
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ color: "#7dd3fc", fontSize: "1.5rem", marginBottom: "20px" }}>
            {t.steps.title}
          </h2>
          <div style={{ display: "grid", gap: "12px" }}>
            {t.steps.items.map((step, i) => (
              <div
                key={i}
                style={{
                  background: "#060f1e",
                  border: "1px solid #1e3a5f",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <span style={{
                  background: "linear-gradient(135deg, #0055cc, #00aaff)",
                  color: "white",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                }}>
                  {i + 1}
                </span>
                <p style={{ color: "#cbd5e1", fontSize: "0.9rem", margin: 0, lineHeight: "1.6" }}>
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Pro Tips */}
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ color: "#7dd3fc", fontSize: "1.5rem", marginBottom: "20px" }}>
            {t.tips.title}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "10px" }}>
            {t.tips.items.map((tip, i) => (
              <div
                key={i}
                style={{
                  background: "#00d4aa0a",
                  border: "1px solid #00d4aa22",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  color: "#6ee7b7",
                  fontSize: "0.85rem",
                }}
              >
                {tip}
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom Grid */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
          gap: "20px",
          marginBottom: "30px"
        }}>
          {/* Supported Strips */}
          <div>
            <h3 style={{ color: "#7dd3fc", fontSize: "1.1rem", marginBottom: "12px" }}>
              {t.support.title}
            </h3>
            <ul style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: "1.8", paddingLeft: "20px" }}>
              {t.support.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          
          {/* Privacy */}
          <div>
            <h3 style={{ color: "#7dd3fc", fontSize: "1.1rem", marginBottom: "12px" }}>
              {t.privacy.title}
            </h3>
            <ul style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: "1.8", paddingLeft: "20px", listStyle: "none" }}>
              {t.privacy.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Get Started Button */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={onClose}
            style={{
              background: "linear-gradient(135deg, #0055cc, #00aaff)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "14px 40px",
              fontSize: "1.1rem",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 0 24px #00aaff44",
            }}
          >
            {t.getStarted} 🚀
          </button>
        </div>
        
        {/* Footer */}
        <div style={{ 
          textAlign: "center", 
          marginTop: "30px", 
          paddingTop: "20px", 
          borderTop: "1px solid #1e3a5f",
          color: "#475569",
          fontSize: "0.75rem"
        }}>
          <p style={{ margin: 0 }}>
            {language === "es" 
              ? "Hecho con 🐠 para entusiastas de acuarios" 
              : "Made with 🐠 for aquarium enthusiasts"}
          </p>
        </div>
      </div>
    </div>
  );
}
