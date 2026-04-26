# 🐠 AquaVision - AI Aquarium Water Analysis

> Professional aquarium monitoring made simple with AI-powered analysis in English and Spanish

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://aquavision.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[🇬🇧 English](#english) | [🇪🇸 Español](#español)

---

## 🎯 What is AquaVision?

**Free AI-powered aquarium analyzer** - Upload photos, get instant expert analysis with actionable recommendations.

### Two Powerful Modes

#### 🧪 Test Strip Analysis
Upload Tetra EasyStrips photos → Get precise chemical readings
- Nitrate, Nitrite, GH, KH, pH, Ammonia
- Color-coded safety status
- Immediate & long-term action plans

#### 📸 Tank Health Check  
Upload tank photos → Get visual condition assessment
- Water clarity, algae, fish health
- Plant condition, substrate, equipment
- Maintenance recommendations

---

## ✨ Features

- 🌍 **Bilingual** - Full English & Spanish support
- 📥 **Export** - Save results as TXT or JSON
- 🎨 **Visual Cards** - No more raw JSON, beautiful UI
- 🚨 **Smart Alerts** - Urgency levels (1-5) with color coding
- 📱 **Mobile Ready** - Works on any device
- 🔒 **100% Secure** - Photos analyzed privately, no data stored
- 💯 **Free Forever** - No signup, no subscription

---

## 🚀 Quick Start

### Use Online (Easiest)
👉 **[aquavision.vercel.app](https://aquavision.vercel.app)** 👈

1. Click **"❓ Help"** button for complete guide
2. Choose mode (Test Strips or Tank Health)
3. Upload photo
4. Get instant analysis
5. Export results

### Deploy Your Own

```bash
git clone https://github.com/andcamac/Aquavision.git
cd Aquavision
npm install
npm run dev
```

**Environment Variable:**
- `ANTHROPIC_API_KEY` - Get from [console.anthropic.com](https://console.anthropic.com)

---

## 📸 How It Works

### Test Strips (Chemical Analysis)

```
1. Dip test strip in water
2. Wait 60 seconds
3. Take photo with good lighting
4. Upload → Click "Analyze"
5. Get color-coded results

Results show:
🟢 SAFE | 🟠 CAUTION | 🟡 WARNING | 🔴 DANGER | ⚫ CRITICAL
```

### Tank Health (Visual Inspection)

```
1. Take clear tank photo
2. Upload → Click "Check Health"
3. Get 6 parameter analysis:
   - Water clarity
   - Algae presence
   - Fish health
   - Plant condition
   - Substrate status
   - Equipment check
4. Follow recommendations
```

---

## 💡 Pro Tips

- 📅 **Weekly**: Tank Health Check (free visual monitoring)
- 📊 **Monthly**: Test Strips (verify water chemistry)
- 💾 **Export**: Save results to track trends
- 🌍 **Language**: Switch EN ↔ ES anytime
- 📸 **Photos**: Good lighting = accurate results

---

## 🎨 What You'll See

Instead of this ❌:
```json
{
  "overallStatus": "danger",
  "urgencyLevel": 4,
  ...
}
```

You get this ✅:

```
┌─────────────────────────────────────┐
│   Estado de Salud del Acuario       │
│        [🚨 Actuar Ahora]            │
└─────────────────────────────────────┘

🌫️ Claridad del Agua - PELIGRO
   Agua turbia con tinte azulado...

⚡ ACCIONES INMEDIATAS
→ Cambio de agua del 50% hoy
→ Verificar sistema de filtración

🔧 MANTENIMIENTO
→ Limpiar medios filtrantes
→ Aspirar sustrato

🎓 VEREDICTO EXPERTO
Situación crítica que requiere...
```

---

## 🛠 Tech Stack

- **React 18** + **Vite 5** - Fast modern frontend
- **Claude AI (Sonnet 4)** - Vision analysis
- **Vercel** - Serverless deployment
- **Zero dependencies** for styling

---

## 🌍 Supported

### Test Strips
- ✅ Tetra EasyStrips 5-in-1
- ✅ Tetra EasyStrips Ammonia
- ✅ Multiple strips per photo
- ✅ Multiple tanks

### Aquariums
- ✅ Freshwater (all sizes)
- ✅ Planted tanks
- ✅ Community tanks
- ✅ Breeding setups

---

## 🔒 Privacy

- ✅ Photos analyzed securely
- ✅ No data stored
- ✅ No account needed
- ✅ Results private to you
- ✅ Open source

---

## 🤝 Contributing

PRs welcome! See [CONTRIBUTING.md](CONTRIBUTING.md)

**Ideas:**
- 🐛 Bug fixes
- 🌍 More languages
- 🧪 More test strip brands
- 🎨 UI improvements

---

## 📄 License

MIT - Free to use and modify

---

## 🙏 Credits

Powered by [Anthropic Claude](https://anthropic.com)

Made with 🐠 for aquarium enthusiasts

---

## Español

### 🎯 ¿Qué es AquaVision?

**Analizador gratuito de acuarios con IA** - Sube fotos, obtén análisis instantáneo con recomendaciones.

### Dos Modos Poderosos

#### 🧪 Análisis de Tiras Reactivas
Sube fotos de Tetra EasyStrips → Obtén lecturas químicas precisas

#### 📸 Revisión de Salud del Acuario
Sube fotos del tanque → Obtén evaluación visual

### 🚀 Uso

👉 **[aquavision.vercel.app](https://aquavision.vercel.app)** 👈

1. Haz clic en **"❓ Ayuda"** para guía completa
2. Elige modo (Tiras o Salud)
3. Sube foto
4. Obtén análisis instantáneo
5. Exporta resultados

### 💡 Consejos

- 📅 **Semanal**: Salud del Acuario
- 📊 **Mensual**: Tiras Reactivas  
- 💾 **Exporta**: Guarda para seguimiento
- 🌍 **Idioma**: Cambia EN ↔ ES cuando quieras

---

**¡100% Gratis | Sin Registro | Código Abierto!**

⭐ **¿Te gusta?** ¡Dale una estrella al repo!
