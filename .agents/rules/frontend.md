---
trigger: always_on
---


---

# 4. `.agents/rules/frontend.md`

```md
---
trigger: glob
globs: "*.tsx, *.jsx, *.ts, *.js, *.html, *.css, *.scss, *.dart"
description: Frontend rules for the hackathon application.
---

# Frontend Rules

## Objective

Build a functional product interface.

Priorities:

1. Functionality
2. Correct data
3. Clear user journey
4. Reliability
5. Accessibility
6. Responsive design
7. Visual polish

## Before Editing

Inspect:

- Existing pages
- Components
- Routes
- API clients
- State management
- Styling
- Dependencies

Reuse existing components whenever possible.

## Primary User Flow

The main flow should look like:

User
→ Input
→ Validation
→ Processing
→ Google AI / Data
→ Result
→ Action / Recommendation

The user must understand what is happening.

## No Fake Functionality

Do not create buttons that only display animations.

Do not create fake:

- AI results
- Statistics
- Predictions
- Pollution measurements
- Health inventory
- Agricultural recommendations
- Infrastructure risk

If demo data is required, label it clearly.

## API Integration

Use the backend API.

Do not expose:

- Database credentials
- Google API keys
- Service account credentials
- Private tokens

Do not duplicate backend business logic unnecessarily.

## Loading States

Every asynchronous operation should have a useful loading state.

Example:

```text
Analyzing your request...
Fetching relevant data...
Generating recommendation...