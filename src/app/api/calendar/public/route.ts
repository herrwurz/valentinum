import { NextResponse } from "next/server";

import { parseCalendarRange } from "@/lib/validation/calendar";
import { ValidationError } from "@/server/errors";
import { calendarService } from "@/server/services/calendar-service-instance";

export async function GET(request: Request) {
  try {
    return NextResponse.json(await calendarService.getPublicEvents(parseCalendarRange(new URL(request.url).searchParams)));
  } catch (error) {
    if (error instanceof ValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    throw error;
  }
}
