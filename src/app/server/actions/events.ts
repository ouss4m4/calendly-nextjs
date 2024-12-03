'use server';

import { eventsFormSchema } from '@/app/schema/events';
import { db } from '@/drizzle/db';
import { EventTable } from '@/drizzle/schema';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export async function createEvent(
  unsafeData: z.infer<typeof eventsFormSchema>
): Promise<{ error: boolean } | undefined> {
  const { userId } = await auth();
  const { success, data } = eventsFormSchema.safeParse(unsafeData);
  if (!success || userId == null) {
    return { error: true };
  }

  await db.insert(EventTable).values({ ...data, clerkUserId: userId });

  return redirect('/events');
}
