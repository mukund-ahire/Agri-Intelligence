import { GoogleGenAI, Type, Schema } from '@google/genai';

export interface AIAdvisoryResponse {
  crop: string;
  possible_issue: string;
  confidence: "High" | "Medium" | "Low";
  severity: "High" | "Medium" | "Low";
  observations: string[];
  recommended_actions: string[];
  prevention: string[];
  weather_considerations: string[];
  limitations: string[];
}

export async function generateAdvisory(
  imageBuffer: Buffer,
  imageMimeType: string,
  lat: number,
  lng: number,
  crop: string,
  weatherContext: string,
  agronomyContext: string
): Promise<AIAdvisoryResponse> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_AI_API_KEY is missing from environment variables.");
  }

  // Initialize with the newly installed supported SDK
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert agricultural AI assistant. 
Analyze the provided crop image and context.

Context:
- Crop specified by user: ${crop}
- Location coordinates: Lat ${lat}, Lng ${lng}
- Weather Context: ${weatherContext}
- Agronomy Context: ${agronomyContext}

Strict constraints:
- Analyze only the supplied image and context.
- Do NOT invent measurements, weather values, or statistics.
- Do NOT claim certainty from an image alone. Explicitly acknowledge uncertainty in the limitations array.
- Avoid unsupported pesticide quantities or dangerous recommendations.
- Base your analysis on visual evidence combined with the provided weather and agronomy context.
`;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      crop: { type: Type.STRING },
      possible_issue: { type: Type.STRING },
      confidence: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
      severity: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
      observations: { type: Type.ARRAY, items: { type: Type.STRING } },
      recommended_actions: { type: Type.ARRAY, items: { type: Type.STRING } },
      prevention: { type: Type.ARRAY, items: { type: Type.STRING } },
      weather_considerations: { type: Type.ARRAY, items: { type: Type.STRING } },
      limitations: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["crop", "possible_issue", "confidence", "severity", "observations", "recommended_actions", "prevention", "weather_considerations", "limitations"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: [
        { role: 'user', parts: [
          { text: prompt },
          { inlineData: { mimeType: imageMimeType, data: imageBuffer.toString('base64') } }
        ]}
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.2
      }
    });

    if (!response.text) {
      throw new Error("Gemini returned an empty response.");
    }

    const parsedResponse = JSON.parse(response.text) as AIAdvisoryResponse;
    
    // Validate returned JSON
    if (!parsedResponse.crop || !parsedResponse.possible_issue || !Array.isArray(parsedResponse.limitations)) {
       throw new Error("Malformed JSON response from Gemini: missing required fields or invalid structure.");
    }
    
    return parsedResponse;
  } catch (error: unknown) {
    console.error("Gemini API Error:", error);
    throw new Error(`Failed to generate advisory from Google AI: ${(error as Error).message}`);
  }
}
