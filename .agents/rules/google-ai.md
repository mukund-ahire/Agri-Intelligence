---
trigger: always_on
---

---
trigger: always_on
description: Core rules for the Google Cloud Build with AI: Code for Communities hackathon.
---

# Hackathon Core Rules

## Project Goal

Build a working, end-to-end prototype for the Google Cloud
"Build with AI: Code for Communities" hackathon.

The project must:

- Solve a real problem relevant to India.
- Have a working end-to-end user flow.
- Use Google AI meaningfully.
- Use real or clearly labelled realistic/sample data.
- Be designed for scalability beyond one city.
- Be deployable.
- Be demonstrable in a 3–5 minute video.

Do not build a concept-only application.

## Mandatory Google AI

Google AI integration is mandatory.

Possible technologies include:

- Gemini API
- Google AI Studio
- Vertex AI
- Gemini multimodal
- Vertex AI Vision
- Speech-to-Text
- Text-to-Speech
- Translation
- Google Earth Engine

Google AI must perform a real function in the application.

Do not add AI only for branding.

## Development Rules

Before modifying code:

1. Read `README.md`.
2. Read `AGENTS.md`.
3. Inspect the existing repository.
4. Understand the current architecture.
5. Reuse existing code where possible.
6. Make the smallest coherent change.
7. Test the change.

Never rewrite working code unnecessarily.

## No Hallucination

Never invent:

- APIs
- Database tables
- Google Cloud services
- Government datasets
- Statistics
- Integrations
- Deployment URLs
- Existing functionality

If something is unknown, inspect the repository or verify the source.

## Data

Use:

- Official public datasets
- Public APIs
- Verified external sources
- Clearly labelled sample data
- Clearly labelled synthetic data

Never present synthetic data as real-world data.

## India-Scale Design

Do not hardcode the solution around one city.

Where applicable, support:

India → State → District → City → Local Area

Use data-driven architecture instead of city-specific logic.

## Security

Never commit:

- API keys
- Passwords
- Service account credentials
- Database passwords
- JWT secrets
- `.env` files containing secrets

Use `.env.example` for configuration documentation.

## Testing

Test the primary flow:

User
→ Frontend
→ Backend
→ Data
→ Google AI
→ Processing
→ Result
→ User

Also test important error cases.

## Demo

The final prototype must support a reliable 3–5 minute demonstration.

The demo should show actual working functionality.

## Agent Behavior

Agents must:

- Inspect before modifying.
- Avoid assumptions.
- Avoid fake functionality.
- Reuse existing code.
- Test changes.
- Document important changes.
- Report anything that could not be verified.