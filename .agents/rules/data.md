---
trigger: always_on
---


---

# 3. `.agents/rules/data.md`

```md
---
trigger: model_decision
description: Rules for datasets, APIs, data pipelines, geospatial data, validation, and data provenance.
---

# Data Rules

## Core Principle

All important data must be:

- Traceable
- Relevant
- Validated
- Reproducible
- Properly sourced

Never fabricate real-world data.

## Potential Sources

Depending on the selected problem, possible sources include:

- data.gov.in
- Indian government open-data portals
- FAO
- WHO
- ISRO/Bhuvan
- IMD
- Google Earth Engine
- Google Maps Platform
- Other verified public APIs

Always verify the actual source before using it.

## Data Provenance

Document important external datasets:

```text
Source:
Dataset:
URL:
Geographic coverage:
Time coverage:
Update frequency:
License:
Known limitations: