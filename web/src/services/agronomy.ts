/**
 * Agronomy Service
 * Fetches curated JSON datasets to ground the AI with region-specific best practices.
 */

export async function getAgronomyContext(cropName: string, state: string): Promise<string> {
  // Return explicit demo curated data required for the MVP context.
  // This is curated demo data modeled on public extension guidelines, not official live government data.
  const curatedDemoDatabase: Record<string, Record<string, string>> = {
    "Wheat": {
      "Punjab": "High risk of Leaf Rust during high humidity. Recommended to ensure proper drainage and avoid excessive nitrogen.",
      "default": "Monitor for fungal infections in humid conditions."
    },
    "Tomato": {
      "default": "Susceptible to early blight. Ensure adequate spacing for airflow."
    }
  };

  const cropData = curatedDemoDatabase[cropName] || curatedDemoDatabase["default"] || {};
  const stateData = cropData[state] || cropData["default"] || "General crop demo guidelines applied.";

  return `[CURATED DEMO DATA] Context for ${cropName} in ${state}: ${stateData}`;
}
