import { NextResponse } from 'next/server';
import { generateAdvisory } from '@/services/ai';
import { fetchLocalWeather } from '@/services/weather';
import { getAgronomyContext } from '@/services/agronomy';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    const latStr = formData.get('lat') as string | null;
    const lngStr = formData.get('lng') as string | null;
    const crop = formData.get('crop') as string | null;

    // 1. Validate inputs
    if (!image || typeof image !== 'object' || !image.name) {
      return NextResponse.json({ success: false, error: "Missing or invalid 'image' file." }, { status: 400 });
    }
    if (!latStr || isNaN(parseFloat(latStr))) {
      return NextResponse.json({ success: false, error: "Missing or invalid 'lat' coordinate." }, { status: 400 });
    }
    if (!lngStr || isNaN(parseFloat(lngStr))) {
      return NextResponse.json({ success: false, error: "Missing or invalid 'lng' coordinate." }, { status: 400 });
    }
    if (!crop || crop.trim() === '') {
      return NextResponse.json({ success: false, error: "Missing or invalid 'crop' name." }, { status: 400 });
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    // 2. Fetch context
    const weatherData = await fetchLocalWeather(lat, lng);
    const weatherContextStr = JSON.stringify(weatherData);
    
    const state = "default"; // Mock state for MVP
    const agronomyContext = await getAgronomyContext(crop, state);

    // 3. Process image buffer
    const arrayBuffer = await image.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    const mimeType = image.type;

    // 4. Call Gemini AI
    const advisory = await generateAdvisory(
      imageBuffer,
      mimeType,
      lat,
      lng,
      crop,
      weatherContextStr,
      agronomyContext
    );

    // 5. Save successful advisory to database
    // We create minimal parent records (Location, Crop, Farmer) to satisfy constraints for the MVP
    const locationRecord = await prisma.location.create({
      data: {
        state: state,
        district: "Unknown",
        block: "Unknown",
        villageFarm: "Unknown",
        lat: lat,
        lng: lng,
      }
    });

    const cropRecord = await prisma.crop.create({
      data: {
        name: crop
      }
    });

    const farmerRecord = await prisma.farmer.create({
      data: {
        name: "Anonymous Web User",
        locationId: locationRecord.id
      }
    });

    await prisma.advisorySession.create({
      data: {
        farmerId: farmerRecord.id,
        cropId: cropRecord.id,
        locationId: locationRecord.id,
        uploadedImageUrl: "in-memory-image", // Instructions: Do not permanently store the uploaded image
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        weatherSnapshot: weatherData as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        aiResponse: advisory as any
      }
    });

    // 6. Return response
    return NextResponse.json({
      success: true,
      advisory: advisory
    });
  } catch (error: unknown) {
    console.error("Advisory API Error:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
