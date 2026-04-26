# 🔧 INTEGRATION GUIDE - Adding Multilingual + Export Features

This guide shows EXACTLY what to add to your existing AquaVision.jsx component.

---

## ✅ Step 1: Copy New Files

Copy these 3 files to your `src/` folder:
```
src/translations.js   ← Complete English/Spanish translations
src/prompts.js        ← Bilingual AI system prompts
src/exportUtils.js    ← Export to TXT/JSON functions
```

---

## ✅ Step 2: Add Imports to AquaVision.jsx

At the top of `AquaVision.jsx`, add these imports:

```javascript
import { getTranslation } from './translations';
import { getSystemPrompt, getUserPrompt } from './prompts';
import { exportToText, exportToJSON } from './exportUtils';
```

---

## ✅ Step 3: Add Language State

Find your existing state declarations (around line 90-100):
```javascript
const [isDragging, setIsDragging] = useState(false);
```

Add this new state variable:
```javascript
const [language, setLanguage] = useState("en"); // 'en' or 'es'
const t = (key) => getTranslation(language, key); // Translation helper
```

---

## ✅ Step 4: Update System Prompts

Find this line (around line 63):
```javascript
const SYSTEM_PROMPT = `You are AquaVision...
```

**DELETE IT** and replace with imports from prompts.js (already done in Step 2).

Then update your `analyzeImage` function to use the bilingual prompts:

Find this section:
```javascript
const response = await fetch("/api/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: SYSTEM_PROMPT, // ← CHANGE THIS LINE
```

Replace with:
```javascript
const systemPrompt = getSystemPrompt(mode, language);
const userPrompt = getUserPrompt(mode, language);

const response = await fetch("/api/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: systemPrompt, // ← Use bilingual prompt
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
          { type: "text", text: userPrompt } // ← Use bilingual prompt
        ],
      },
    ],
  }),
});
```

---

## ✅ Step 5: Add Language Toggle Button

Find the header section (around line 250-280):

```javascript
{/* Header */}
<div style={{ textAlign: "center", marginBottom: "32px" }}>
  {/* Existing header content */}
</div>
```

**ADD AFTER the header div:**

```javascript
{/* Language Toggle */}
<div style={{ 
  position: "absolute", 
  top: "20px", 
  right: "20px", 
  zIndex: 10 
}}>
  <button
    onClick={() => setLanguage(language === "en" ? "es" : "en")}
    style={{
      background: "linear-gradient(135deg, #0055cc, #00aaff)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "8px 16px",
      fontSize: "0.85rem",
      cursor: "pointer",
      fontFamily: "'Courier New', monospace",
      letterSpacing: "0.1em",
      boxShadow: "0 0 18px #00aaff44",
      transition: "all 0.2s",
    }}
  >
    {language === "en" ? "🇪🇸 ES" : "🇬🇧 EN"}
  </button>
</div>
```

---

## ✅ Step 6: Replace Hard-coded Text with Translations

This is the most important step! Replace ALL hard-coded English text with `t(key)` calls.

### Header Section:
```javascript
// Before:
<p style={...}>AI · Aquarium Water Analysis</p>

// After:
<p style={...}>{t("appSubtitle")}</p>
```

### Mode Selector:
```javascript
// Before:
🧪 Test Strips

// After:
{t("modeStrips")}
```

### Upload Zone:
```javascript
// Before:
<p>Upload Test Strip Photo</p>

// After:
<p>{mode === "strips" ? t("uploadStripTitle") : t("uploadTankTitle")}</p>
```

### Buttons:
```javascript
// Before:
<button>🔬 Analyze Strips</button>

// After:
<button>{mode === "strips" ? t("analyzeStrips") : t("analyzeTank")}</button>
```

### Status Labels:
```javascript
// Before:
label: "SAFE"

// After:
label: t("statusSafe")
```

### Results Headers:
```javascript
// Before:
<p>⚡ Immediate Actions</p>

// After:
<p>{t("immediateActions")}</p>
```

**Continue this pattern for ALL visible text!**

---

## ✅ Step 7: Add Export Button

In the results section, add an Export button after the "New Analysis" button:

```javascript
{results && (
  <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "20px" }}>
    <button onClick={reset} style={...}>
      {t("newAnalysis")}
    </button>
    
    {/* NEW: Export Button */}
    <button
      onClick={async () => {
        try {
          const filename = exportToText(results, mode, language, t);
          // Show success message (add a toast/notification state)
          alert(t("exportSuccess"));
        } catch (err) {
          alert(t("exportError"));
        }
      }}
      style={{
        background: "linear-gradient(135deg, #0055cc, #00aaff)",
        color: "white",
        border: "none",
        borderRadius: "8px",
        padding: "7px 16px",
        fontSize: "0.78rem",
        cursor: "pointer",
        fontFamily: "'Courier New', monospace",
      }}
    >
      {t("export")}
    </button>
  </div>
)}
```

---

## ✅ Step 8: Update Error Messages

Find error handling sections:

```javascript
// Before:
setError("Please upload an image file");

// After:
setError(t("uploadError"));
```

---

## ✅ Step 9: Update Footer

```javascript
// Before:
AQUAVISION · AI WATER CHEMISTRY · POWERED BY CLAUDE

// After:
{t("footerText")}
```

---

## 🎯 Quick Test Checklist

After integration, test these:

1. [ ] Language toggle works
2. [ ] All text changes when switching languages
3. [ ] Mode selector shows translated text
4. [ ] Upload instructions are translated
5. [ ] Analyze button shows correct language
6. [ ] Results display in correct language
7. [ ] Export button appears
8. [ ] Export creates file with correct filename
9. [ ] Export file content is in correct language
10. [ ] Error messages show in correct language

---

## 🔍 Complete Example: Upload Zone

Here's a complete before/after for the upload zone:

### BEFORE:
```javascript
<p>Upload Test Strip Photo</p>
<p>Drop here or click to browse</p>
```

### AFTER:
```javascript
<p>{mode === "strips" ? t("uploadStripTitle") : t("uploadTankTitle")}</p>
<p>{t("uploadInstruction")}</p>
```

---

## 📊 Translation Key Reference

Common keys you'll use:

| Key | English | Spanish |
|-----|---------|---------|
| `appName` | AquaVision | AquaVision |
| `appSubtitle` | AI · Aquarium Water Analysis | IA · Análisis de Agua de Acuario |
| `modeStrips` | 🧪 Test Strips | 🧪 Tiras Reactivas |
| `modeTank` | 📸 Tank Health | 📸 Salud del Acuario |
| `analyze` | Analyze | Analizar |
| `reset` | ↺ Reset | ↺ Reiniciar |
| `export` | 📥 Export Results | 📥 Exportar Resultados |
| `statusSafe` | SAFE | SEGURO |
| `urgencyActNow` | 🚨 Act Now | 🚨 Actuar Ahora |

See `translations.js` for the complete list of 60+ keys.

---

## ⚠️ Common Mistakes

1. **Forgetting to call t() function**
   ```javascript
   ❌ <p>Upload Photo</p>
   ✅ <p>{t("uploadStripTitle")}</p>
   ```

2. **Using wrong key names**
   ```javascript
   ❌ {t("uploadTitle")}  // Doesn't exist
   ✅ {t("uploadStripTitle")}
   ```

3. **Not updating prompts**
   ```javascript
   ❌ system: SYSTEM_PROMPT
   ✅ system: getSystemPrompt(mode, language)
   ```

4. **Hard-coding language in export**
   ```javascript
   ❌ exportToText(results, mode, "en", t)
   ✅ exportToText(results, mode, language, t)
   ```

---

## 🚀 You're Done!

After completing all steps:
1. Test both languages thoroughly
2. Try both modes (strips + tank)
3. Test export functionality
4. Verify AI responds in correct language
5. Deploy to Vercel

**Questions? Check README-MULTILINGUAL.md for details!**
