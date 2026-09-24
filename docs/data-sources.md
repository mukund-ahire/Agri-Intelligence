# Data Sources

## 1. Weather Data
- **Source**: OpenWeather API / IMD API.
- **Purpose**: Provides real-time temperature, humidity, and precipitation context to the AI model to improve the relevance of the advisory.
- **Status**: Live API integration (or labeled demo fallback if API limits are exceeded during the hackathon).

## 2. Agronomy Context Data
- **Source**: Curated JSON datasets modeled after Indian Agricultural Extension guidelines (e.g., KVK advisories) and public domain agricultural standards.
- **Purpose**: Grounding the AI with region-specific best practices to prevent hallucination.
- **Status**: **Curated Demo Data**. This is explicitly labeled as sourced/curated data and not official live government data.

## 3. Crop Images
- **Source**: Public domain or appropriately licensed agricultural datasets (e.g., PlantVillage dataset).
- **Purpose**: Used for testing and ensuring deterministic, reliable hackathon demonstrations.
- **Status**: **Demo Data**. These images are used to demonstrate the multimodal workflow and do not represent live farmer submissions.

*Note: The Gemini AI model will be strictly instructed not to hallucinate measurements or fabricate external dataset statistics.*
