# API Contracts

## 1. `POST /api/advisory`
Analyzes a crop image along with location context to generate a structured agricultural advisory.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `image`: File (JPEG/PNG)
  - `lat`: Number (Latitude)
  - `lng`: Number (Longitude)
  - `crop`: String

**Response (200 OK):**
```json
{
  "success": true,
  "advisory": {
    "crop": "Wheat",
    "possible_issue": "Leaf Rust",
    "confidence": "Medium",
    "severity": "High",
    "observations": ["Orange-brown pustules on leaf surface"],
    "recommended_actions": ["Apply appropriate fungicide", "Remove heavily infected leaves"],
    "prevention": ["Use resistant varieties next season", "Avoid excessive nitrogen fertilizers"],
    "weather_considerations": ["High humidity in the next 48 hours may worsen the condition"],
    "limitations": "This is an AI-generated assessment based on visual data. Consult a local agricultural expert or extension worker for a definitive diagnosis."
  }
}
```

## 2. `GET /api/weather` (Internal Service Interface)
Fetches current weather for a location. Wrapped behind a service interface in the backend.

**Request:**
- Query Parameters: `?lat={lat}&lng={lng}`

**Response (200 OK):**
```json
{
  "temp": 28.5,
  "humidity": 65,
  "conditions": "Partly Cloudy",
  "source": "OpenWeather API"
}
```
