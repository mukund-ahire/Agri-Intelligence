/**
 * Weather Service
 * Fetches real-time weather context from an external API (e.g. OpenWeather).
 */

export interface WeatherData {
  temp: number;
  humidity: number;
  conditions: string;
  source: string;
}

export async function fetchLocalWeather(lat: number, lng: number): Promise<WeatherData> {
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey || apiKey === '') {
    console.warn("WEATHER_API_KEY is missing. Falling back to explicit demo data.");
    return {
      temp: 28.5,
      humidity: 65,
      conditions: "Partly Cloudy",
      source: "DEMO DATA (Live API key not configured)"
    };
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Weather API failed: ${response.status} ${response.statusText}`);
      throw new Error(`Live Weather API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    return {
      temp: data.main.temp,
      humidity: data.main.humidity,
      conditions: data.weather[0]?.main || "Unknown",
      source: "Live API (OpenWeather)"
    };
  } catch (error: unknown) {
    console.error("fetchLocalWeather error:", error);
    throw new Error(`Failed to fetch live weather data: ${(error as Error).message}`);
  }
}
