# Architecture: Agricultural Intelligence (Track 4)

## Overview
The application is built as a monolithic Next.js web application. This approach simplifies deployment, ensures a responsive mobile-first UI for farmers, and keeps all Google AI and third-party API credentials securely isolated on the server.

## Technology Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Prisma ORM recommended for clean abstraction)
- **AI/ML**: Google Gemini API (using the latest supported model via `@google/genai` or `@google/generative-ai` SDK)

## Core Workflow
1. **Farmer**: Selects location (State → District → Block → Village).
2. **Farmer**: Selects crop type.
3. **Farmer**: Uploads crop image (e.g., showing a potential disease).
4. **System**: Fetches real-time weather context for the location via an external API.
5. **System**: Orchestrates the data (image + weather + agronomy context) and sends it to Google Gemini for multimodal analysis.
6. **AI**: Returns a validated, structured agricultural assessment based on the defined JSON schema.
7. **System**: Saves the advisory to the PostgreSQL database.
8. **Farmer**: Views the localized advisory on their dashboard, which clearly displays uncertainty limitations.

## Service Boundaries
To maintain a scalable and clean architecture, external integrations are hidden behind service interfaces:
- **`services/weather.ts`**: Fetches and formats real weather data (or labeled demo data).
- **`services/ai.ts`**: Wraps the Google Gemini SDK, manages the prompt, enforces the structured output schema, and handles AI errors/timeouts.
- **`services/agronomy.ts`**: Retrieves curated demo agronomy data for context grounding.

## Database Design
To support Indian geographic scale without over-engineering the MVP, the database includes a hierarchical location model.

**Core Entities:**
- `Location` (id, state, district, block, village_farm, lat, lng)
- `Farmer` (id, name, location_id, preferred_language)
- `Crop` (id, name, variety)
- `AdvisorySession` (id, farmer_id, crop_id, location_id, uploaded_image_url, weather_snapshot, ai_response, created_at)

## AI Design & Structured Output
Google Gemini will be accessed securely via Next.js server-side API routes. The prompt strictly instructs the model **NOT** to invent weather, soil, or crop measurements, and to rely only on the injected context and image analysis.

The AI response must adhere to the following schema:

```json
{
  "crop": "string",
  "possible_issue": "string",
  "confidence": "string (High|Medium|Low)",
  "severity": "string (High|Medium|Low)",
  "observations": ["string"],
  "recommended_actions": ["string"],
  "prevention": ["string"],
  "weather_considerations": ["string"],
  "limitations": "string (Disclaimer that this is an AI advisory and not a definitive diagnosis)"
}
```
