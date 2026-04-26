# 🐠 AquaVision

> AI-powered aquarium water test strip analyzer — snap a photo, get instant expert water quality analysis.

![AquaVision](https://img.shields.io/badge/powered%20by-Claude%20AI-7dd3fc?style=flat-square)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)

---

## ✨ What It Does

Upload a photo of your **Tetra EasyStrips** water test results and AquaVision will:

- 🔬 Read each test pad color and estimate parameter values
- 🐠 Analyze multiple strips at once (one per tank)
- ⚠️ Flag parameters outside safe ranges with color-coded status
- 📋 Give you immediate and short-term action plans
- 🎓 Provide an expert aquarist verdict

**Supports:**
- Tetra EasyStrips 5-in-1 (Nitrate, Nitrite, Hardness GH, Alkalinity KH, pH)
- Tetra EasyStrips Ammonia (NH₃/NH₄⁺)
- Both strip types in a single photo

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/aquavision.git
cd aquavision
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up your API key
```bash
cp .env.example .env
```

Then open `.env` and add your Anthropic API key:
```
VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

Get a free API key at: https://console.anthropic.com

### 4. Run locally
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

---

## 📁 Project Structure

```
aquavision/
├── public/
│   └── favicon.svg          # App icon
├── src/
│   ├── main.jsx            # React entry point
│   ├── App.jsx             # Root component
│   └── AquaVision.jsx      # Main app (UI + API logic)
├── .env.example            # Template for environment variables
├── .gitignore              # Git ignore rules
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── vercel.json             # Vercel deployment config
├── vite.config.js          # Vite configuration
└── README.md               # This file
```

---

## 🔧 How It Works

1. **User uploads photo** → Image converted to base64 in browser
2. **Sent to Claude API** → claude-sonnet-4-20250514 with detailed color reference chart
3. **AI reads strips** → Claude analyzes pad colors against Tetra reference values
4. **Structured response** → Returns JSON with readings, safety status, and actions
5. **UI renders results** → Color-coded cards per tank with expert recommendations

### Safe Parameter Ranges

| Parameter | Safe Range |
|-----------|-----------|
| Nitrate NO₃ | < 20 ppm |
| Nitrite NO₂ | 0 ppm |
| Hardness GH | 75–150 ppm |
| Alkalinity KH | 80–120 ppm |
| pH | 6.8–7.8 |
| Ammonia NH₃ | 0 ppm |

---

## 🛠️ Tech Stack

- **React 18** — UI framework
- **Vite 5** — Build tool and dev server
- **Anthropic Claude API** — Vision AI (claude-sonnet-4-20250514)
- **FileReader API** — Image to base64 conversion
- **Pure CSS-in-JS** — No UI library dependencies

---

## 🚀 Deploy to Vercel

1. Push your code to GitHub
2. Go to https://vercel.com and import your repository
3. Add environment variable:
   - Name: `VITE_ANTHROPIC_API_KEY`
   - Value: Your Anthropic API key
4. Deploy!

---

## ⚠️ Security Note

This app calls the Anthropic API directly from the browser. The API key is exposed in production builds.

**For local development:** This is fine.

**For production:** Consider adding a backend proxy (Express, Cloudflare Worker, Vercel Serverless Function) to keep your API key server-side.

---

## 🗺️ Roadmap

- [ ] Backend proxy for API key security
- [ ] Test history tracking per tank
- [ ] Fish species profiles with custom safe ranges
- [ ] Dosing calculator
- [ ] PWA support (installable on mobile)
- [ ] PDF export of results
- [ ] Push notifications for parameter alerts

---

## 📝 License

MIT License - feel free to use, modify, and distribute.

---

## 🐠 About

Created to help aquarium hobbyists maintain healthy water conditions using AI-powered image analysis.

**Not affiliated with Tetra or any aquarium product manufacturer.**

Always verify critical readings with liquid test kits before making major tank adjustments.
