'use server';

import { scheduleFormSchema } from '@/app/schema/schedule';
import { db } from '@/drizzle/db';
import { scheduleAvailabilityTable, ScheduleTable } from '@/drizzle/schema';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { BatchItem } from 'drizzle-orm/batch';
import { z } from 'zod';

export default async function saveSchedule(
  unsafeData: z.infer<typeof scheduleFormSchema>
) {
  const { userId } = await auth();
  const { success, data } = scheduleFormSchema.safeParse(unsafeData);
  if (!success || userId == null) {
    return { error: true };
  }

  const { availabilities, timezone } = data;

  const [{ id: scheduleId }] = await db
    .insert(ScheduleTable)
    .values({ timezone, clerkUserId: userId })
    .onConflictDoUpdate({
      target: ScheduleTable.clerkUserId,
      set: { timezone },
    })
    .returning({ id: ScheduleTable.id });

  const statements: [BatchItem<'pg'>] = [
    db
      .delete(scheduleAvailabilityTable)
      .where(eq(scheduleAvailabilityTable.scheduleId, scheduleId)),
  ];

  if (availabilities.length) {
    statements.push(
      db.insert(scheduleAvailabilityTable).values(
        availabilities.map((avail) => ({
          ...avail,
          scheduleId,
        }))
      )
    );
  }

  await db.batch(statements);
}
