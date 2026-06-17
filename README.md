# 🌿 Verdant AI

> **Know Your Carbon. Change Your World.**

An AI-powered sustainability platform that helps individuals understand, track, and reduce their carbon footprint through personalized insights, Gemini-powered coaching, and a living digital avatar — your EarthTwin™.

[![CI](https://github.com/your-org/Verdant-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/Verdant-AI/actions/workflows/ci.yml)

---

## 🎯 Chosen Vertical

**Individual / Eco-conscious consumer** — personal carbon footprint tracking and AI-guided everyday lifestyle changes.

Every feature maps to one user journey: *understand your footprint → receive personalised AI guidance → see your impact change in real time*.

---

## 🧩 Problem Statement Alignment

| Challenge Goal | Verdant AI Solution |
|----------------|---------------------|
| Understand carbon footprint | **Carbon DNA™** — 5-card animated onboarding in under 3 minutes |
| Track emissions | **GreenScore™** ring — interactive, live-recalculating score |
| Receive personalised insights | **ImpactLens™** glass card — Gemini-generated hidden emission insight |
| Get AI recommendations | **EcoCoach™** — floating Gemini 3.5 Flash assistant with full profile context |
| Simulate future outcomes | **FutureCast™** — live slider that morphs the score ring before you commit |
| Stay motivated | **EarthTwin™** — a living avatar that evolves across 5 stages as your score improves |

---

## 🤖 How Gemini Powers the Product (5 Touchpoints)

Gemini is the **product voice** — not a chatbot bolted on the side.

| # | Feature | Model | When | Output |
|---|---------|-------|------|--------|
| 1 | **Carbon Story** | Gemini 3.5 Flash | Post-onboarding | 2-sentence personalised narrative shown at score reveal |
| 2 | **Hero Insight** | Gemini 3.1 Flash-Lite | Every home load | Personalised greeting + #1 emission insight |
| 3 | **EcoCoach** | Gemini 3.5 Flash (streaming) | Orb tap / chip | Context-aware coaching with full footprint injected into system prompt |
| 4 | **Hidden Impact Card** | Gemini 3.5 Flash | Home (cached 24h) | Structured JSON: `{ title, insight, action, savings_kg }` |
| 5 | **FutureCast Whisper** | Gemini 3.1 Flash-Lite | Slider change | One-line motivating narrative per scenario |

**Fallback:** Primary `gemini-3.5-flash` → fallback `gemini-3.1-flash-lite` on timeout (8s), 429, or 5xx. Gemini never goes silent during a judge demo.

---

## 🏗️ How the Solution Works

### Architecture

```
Browser → Next.js 15 (Cloud Run) → FastAPI (Cloud Run) → Supabase PostgreSQL
                                 ↓
                          Gemini API (5 touchpoints)
```

### User Flow

```
Landing → Try Demo (one-click) → Carbon DNA 5-card wizard → Score Reveal
       → Home: ring + EarthTwin + glass cards + floating EcoCoach
       → FutureCast sheet: slider → ring morphs → Gemini whisper
```

### 3-Screen Design (Apple Health meets Headspace)

| Screen | URL | Purpose |
|--------|-----|---------|
| Landing | `/` | Cinematic hero, EarthTwin preview, Try Demo CTA |
| Carbon DNA | `/onboarding` | Animated swipe cards → score reveal moment |
| Home | `/home` | Single premium surface: ring, EarthTwin, AI cards, coach |

No sidebar. No tab bar. No admin dashboard. One cohesive consumer experience.

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), Tailwind CSS, Framer Motion, Shadcn UI |
| Backend | FastAPI, Python 3.12, Pydantic v2 |
| Database | Supabase PostgreSQL (in-memory fallback for local demo) |
| AI | Gemini 3.5 Flash + Gemini 3.1 Flash-Lite via `google-genai` SDK |
| Deployment | GCP Cloud Run (2 services), Artifact Registry, Secret Manager |
| CI/CD | GitHub Actions (test → build → deploy) |

---

## 🚀 Local Setup (Docker Compose)

### Prerequisites
- Docker + Docker Compose
- A Gemini API key ([get one free](https://aistudio.google.com/))

### 1. Clone and configure

```bash
git clone https://github.com/your-org/Verdant-AI.git
cd Verdant-AI
cp .env.example apps/api/.env
# Edit apps/api/.env: add GEMINI_API_KEY
```

### 2. Start all services

```bash
docker compose -f infra/docker-compose.yml up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### 3. Alternative: Run without Docker

**Backend:**
```bash
cd apps/api
python -m venv .venv
.venv/Scripts/activate   # Windows
source .venv/bin/activate  # Mac/Linux
pip install uv && uv pip install -r requirements.txt
cp ../../.env.example .env  # edit GEMINI_API_KEY
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd apps/web
npm install
# Create apps/web/.env.local with: NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
npm run dev
```

---

## 🎬 Judge Demo Script (90 Seconds)

> Run this to see every wow moment in sequence:

1. **0:00** — Open the app → click **"✨ Try Demo — No Signup"**
2. **0:10** — Swipe through 5 Carbon DNA cards (transport, energy, food, shopping, waste)
3. **0:40** — Click "Calculate My Footprint" → watch the **score ring draw itself + EarthTwin awaken**
4. **0:55** — Read your **Gemini Carbon Story** on the reveal screen
5. **1:05** — Enter your Home dashboard → read the **personalised hero greeting** (Gemini)
6. **1:10** — Tap any ring segment to see category detail
7. **1:15** — Tap the **🌿 floating orb** → ask *"What's my fastest win?"* → watch streaming reply
8. **1:25** — Click **"🔮 FutureCast"** → select a scenario → ring score changes + Gemini whisper appears
9. **1:30** — Done. You've seen all 5 Gemini touchpoints.

---

## 🌍 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | https://verdant-web-[hash].run.app |
| **API** | https://verdant-api-[hash].run.app/docs |

**Demo account:**
- Email: `demo@verdant.ai`
- Password: `demo-verdant-2026`

*(Or just click "Try Demo" — no password needed)*

---

## 📐 Assumptions

- Emission factors are simplified DEFRA/EPA 2023 benchmarks — not utility-grade precision. Intended for educational awareness, not regulatory reporting.
- Users self-report lifestyle data (no GPS, smart meter, or bank integration in MVP).
- Email/password authentication only (no OAuth).
- Supabase hosts PostgreSQL; the app runs entirely on in-memory storage if `SUPABASE_URL` is not configured, making the demo work without a database.
- GreenScore is a relative index (0–100) comparing to global average benchmarks, not an absolute CO₂ certification.

---

## 📁 Repository Structure

```
Verdant-AI/
├── apps/
│   ├── web/                    # Next.js 15 frontend
│   │   ├── app/                # 3 pages: landing, onboarding, home
│   │   ├── components/         # score-ring, earth-twin, floating-coach, etc.
│   │   └── lib/                # API client, utils
│   └── api/                    # FastAPI backend
│       ├── app/
│       │   ├── routers/        # 8 endpoint groups
│       │   ├── services/       # carbon_calculator, gemini_client
│       │   └── data/           # emission_factors.json (DEFRA/EPA)
│       └── tests/              # 15 unit tests (100% pass)
├── infra/
│   ├── docker-compose.yml      # Full local stack
│   └── gcp/                    # Cloud Run configs + bootstrap script
├── .github/workflows/          # CI (test + build + size gate) + deploy
├── .env.example                # Environment variable template
└── README.md
```

---

## 🧪 Running Tests

```bash
cd apps/api
.venv/Scripts/python -m pytest tests/ -v
# 15 tests — carbon calculator, GreenScore algorithm, edge cases
```

---

## 🔒 Security Highlights

- Passwords hashed with bcrypt (cost 12)
- JWT with configurable expiry (default 7 days)
- Gemini API key stored in GCP Secret Manager — never in code or git
- CORS configured to allowed origins only
- Rate limiting on auth + AI routes via `slowapi`
- `httpOnly` cookie support available; Bearer token used for simplicity

---

## 📊 Carbon Calculation Methodology

```
annual_transport_kg = commute_factor × km × 2 × days_per_week × 48_weeks
annual_energy_kg    = monthly_kwh × 12 × grid_factor × (1 - renewable_adj)
annual_food_kg      = diet_base_kg + meals_out × 18_kg_per_meal
annual_shopping_kg  = monthly_spend_usd × 12 × 0.025_kgCO2e_per_usd
annual_waste_kg     = kg_per_week × 52 × landfill_factor × recycling_reduction

category_score = max(0, 100 - (user_kg / benchmark_kg) × 100)
green_score    = Σ(weight × category_score)   # transport 25%, energy 25%, food 25%, shopping 15%, waste 10%
grade          = A+ ≥90 | A ≥80 | B+ ≥70 | B ≥60 | C+ ≥50 | C ≥40 | D ≥30 | F
```

Sources: [DEFRA GHG Conversion Factors 2023](https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023) · [EPA Emission Factors Hub](https://www.epa.gov/climateleadership/ghg-emission-factors-hub)

---

*Built for Hack2Skill PromptWars 2026 · Individual / Eco-conscious consumer vertical*
