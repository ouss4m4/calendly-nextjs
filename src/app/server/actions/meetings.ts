'use server';

import { meetingActionSchema } from '@/app/schema/meetings';
import { db } from '@/drizzle/db';
import { getValidTimesFromSchedule } from '@/lib/getValidTimesFromSchedule';
import { z } from 'zod';
import { createCalendarEvent } from '../googleCalendar';
import { redirect } from 'next/navigation';
import { fromZonedTime } from 'date-fns-tz';

export async function createMeeting(
  unsafeData: z.infer<typeof meetingActionSchema>
) {
  const { success, data } = meetingActionSchema.safeParse(unsafeData);

  if (!success) {
    return { error: true };
  }

  const event = await db.query.EventTable.findFirst({
    where: ({ clerkUserId, isActive, id }, { eq, and }) =>
      and(
        eq(clerkUserId, data.clerkUserId),
        eq(isActive, true),
        eq(id, data.eventId)
      ),
  });
  if (event == null) return { error: true };

  const startInTimeZone = fromZonedTime(data.startTime, data.timezone);

  const validTimes = await getValidTimesFromSchedule([data.startTime], event);
  if (validTimes.length == 0) {
    return { error: true };
  }

  await createCalendarEvent({
    ...data,
    startTime: startInTimeZone,
    durationInMinutes: event.durationInMinutes,
    eventName: event.name,
  });

  redirect(
    `/book/${data.clerkUserId}/${data.eventId}/success?startTime=${data.startTime.toISOString()}`
  );
}
