# Agri-Intelligence

> AI-powered crop advisory system for Indian farmers — Google Cloud "Build with AI: Code for Communities" Hackathon

---

## Problem

Indian farmers often face crop disease and stress without access to timely, expert agricultural guidance. Consulting agronomists is expensive and slow. Many smallholder farmers lack access to reliable diagnostic tools in their local language or region.

## Solution

Agri-Intelligence is a mobile-first web application that allows a farmer to:

1. Share their GPS location (or enter coordinates manually)
2. Select their crop
3. Upload or photograph a crop image from their phone
4. Receive an instant, structured AI-powered advisory

The advisory is grounded in real-time weather data and curated agronomy context — not generic advice.

## Target Users

- Smallholder farmers across India
- Agricultural extension workers
- Farmer producer organisations (FPOs)

---

## User Workflow

```
Farmer opens application
        ↓
Selects location (GPS or manual)
        ↓
Selects crop
        ↓
Uploads / photographs crop
        ↓
Clicks Analyze Crop
        ↓
Real Gemini AI multimodal inference
        ↓
Advisory displayed:
  - Detected issue
  - Confidence + Severity
  - Observations
  - Recommended Actions
  - Prevention
  - Weather context
  - Limitations / disclaimer
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| Backend API | Next.js API Routes (server-side only) |
| AI | Google Gemini 3.5 Flash-Lite (multimodal) via `@google/genai` |
| Weather | OpenWeather API (live data) |
| Database | PostgreSQL (Supabase), Prisma v7 with `@prisma/adapter-pg` |
| Deployment | Vercel-compatible |

---

## Google AI Integration

The application uses **Google Gemini 3.5 Flash-Lite** for real multimodal inference:

- The crop image is sent to Gemini as base64 inline data
- A structured prompt includes live weather context and curated agronomy context
- Gemini returns a structured JSON advisory enforced by `responseSchema`
- The response is validated server-side before being returned to the user

Gemini is **never called from the browser**. All AI calls are made server-side in `web/src/services/ai.ts`.

---

## Weather Integration

Live weather data is fetched from the **OpenWeather API** (`/data/2.5/weather`) using the farmer's latitude and longitude.

If `WEATHER_API_KEY` is not set, the service returns clearly labelled demo data and logs a warning. The service never silently fabricates weather measurements.

---

## Agronomy Data

Curated agronomy context is returned from `web/src/services/agronomy.ts`.

This is demo/curated data modelled on public agricultural extension guidelines. It is **clearly labelled** as demo data and is NOT claimed to be official live government data.

---

## Architecture

```
Browser
  └─ POST /api/advisory (multipart/form-data: image, lat, lng, crop)
          ↓
  Input Validation
          ↓
  Weather Service (OpenWeather API)
          ↓
  Agronomy Service (curated demo context)
          ↓
  AI Service (Google Gemini 3.5 Flash-Lite)
          ↓
  Response Validation
          ↓
  Prisma → PostgreSQL (AdvisorySession saved)
          ↓
  JSON response → Frontend → Advisory displayed
```

---

## Setup Instructions

### Prerequisites

- Node.js 20+
- PostgreSQL database (or Supabase)
- Google AI API key (AI Studio)
- OpenWeather API key

### Installation

```bash
cd web
npm install
npx prisma generate
```

### Environment Variables

Copy `.env.example` to `web/.env` and fill in:

```env
GOOGLE_AI_API_KEY=      # Google AI Studio API key
WEATHER_API_KEY=         # OpenWeather API key
DATABASE_URL=            # PostgreSQL connection string (pooled, for Prisma runtime)
DIRECT_URL=              # PostgreSQL connection string (direct, for migrations)
```

See `.env.example` at the root for the full template.

### Database

```bash
cd web
npx prisma db push
```

### Run (Development)

```bash
cd web
npm run dev
```

Open http://localhost:3000

### Build (Production)

```bash
cd web
npm run build
npm start
```

---

## API

### POST /api/advisory

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `image` | File (JPEG/PNG) | Yes | Crop photograph |
| `lat` | string (float) | Yes | Latitude |
| `lng` | string (float) | Yes | Longitude |
| `crop` | string | Yes | Crop name |

**Response (200 OK):**

```json
{
  "success": true,
  "advisory": {
    "crop": "Wheat",
    "possible_issue": "Wheat Leaf Rust",
    "confidence": "High",
    "severity": "High",
    "observations": ["..."],
    "recommended_actions": ["..."],
    "prevention": ["..."],
    "weather_considerations": ["..."],
    "limitations": ["..."]
  }
}
```

**Error responses:** `400` for invalid input, `500` for AI/service failures.

---

## Database Schema

| Model | Purpose |
|---|---|
| `Location` | Hierarchical geographic record (state → district → block → village, lat/lng) |
| `Farmer` | Farmer record linked to a location |
| `Crop` | Crop type |
| `AdvisorySession` | Records each successful advisory with AI response and weather snapshot |

---

## Limitations

- The Gemini advisory is based on visual analysis of a single image and cannot replace a field diagnosis by a qualified agronomist.
- Agronomy context is curated demo data, not a live government dataset.
- Farmer records are created anonymously (no authentication in the current MVP).
- No multilingual support in the current version.
- No offline mode.

---

## Current Implementation Status

| Feature | Status |
|---|---|
| Crop image upload + preview | ✅ Implemented |
| GPS geolocation | ✅ Implemented |
| Manual coordinate entry | ✅ Implemented |
| Crop selection | ✅ Implemented |
| Live weather context | ✅ Implemented (OpenWeather) |
| Agronomy context | ✅ Implemented (curated demo) |
| Gemini multimodal AI advisory | ✅ Implemented + verified |
| Structured response validation | ✅ Implemented |
| PostgreSQL persistence | ✅ Implemented (Supabase) |
| Mobile-first UI | ✅ Implemented |
| Input validation + error handling | ✅ Implemented |
| Accessibility (labels, aria, keyboard) | ✅ Implemented |
| Authentication | ❌ Not implemented (MVP) |
| Multilingual support | ❌ Not implemented |
| Offline mode | ❌ Not implemented |
| Deployment (production URL) | ⏳ Pending |

---

## Data Sources

| Source | Usage | Type |
|---|---|---|
| OpenWeather API | Live weather by lat/lng | Live |
| Agronomy context | Crop-specific guidelines | Curated demo |
| Gemini visual analysis | Crop disease inference | AI inference |

---

## License

MIT
