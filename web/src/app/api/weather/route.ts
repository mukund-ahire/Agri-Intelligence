import { NextResponse } from 'next/server';
import { fetchLocalWeather } from '@/services/weather';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');

  try {
    const weather = await fetchLocalWeather(lat, lng);
    return NextResponse.json({ success: true, data: weather });
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch weather" }, { status: 500 });
  }
}
