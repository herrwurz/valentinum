import { NextResponse } from "next/server";

import { getCurrentActor } from "@/lib/auth/session";
import { parseCalendarRange } from "@/lib/validation/calendar";
import { PermissionError, ValidationError } from "@/server/errors";
import { calendarService } from "@/server/services/calendar-service-instance";

export async function GET(request: Request) {
  try {
    const events = await calendarService.getAdminEvents(await getCurrentActor(), parseCalendarRange(new URL(request.url).searchParams));
    return NextResponse.json(events);
  } catch (error) {
    if (error instanceof ValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    if (error instanceof PermissionError) return NextResponse.json({ error: error.message }, { status: 403 });
    throw error;
  }
}
