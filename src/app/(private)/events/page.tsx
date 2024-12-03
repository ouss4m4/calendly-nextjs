// import { Button } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { db } from '@/drizzle/db';
import { RedirectToSignIn } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { CalendarPlus, CalendarRange } from 'lucide-react';
import Link from 'next/link';

import React from 'react';

export default async function EventsPage() {
  const { userId } = await auth();
  if (userId == null) return RedirectToSignIn({});

  const events = await db.query.EventTable.findMany({
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
    orderBy: ({ createdAt }, { desc }) => desc(createdAt),
  });

  return (
    <>
      <div className="flex items-baseline gap-4">
        <h1 className="mb-6 text-3xl font-semibold lg:text-4xl xl:text-5xl">
          Events
        </h1>
        <Button asChild>
          <Link href="/events/new">
            <CalendarPlus className="mr-4 size-6" /> New Event
          </Link>
        </Button>
      </div>

      {events.length > 0 ? (
        'got something'
      ) : (
        <div className="flex flex-col items-center gap-4">
          <CalendarRange className="mx-auto size-16" />
          You&apos;re all clear! Unless you don&apos;t want to be anymore so you
          gotta createvents
          <Button size="lg" className="text-lg" asChild>
            <Link href="/events/new">
              <CalendarPlus className="mr-4 size-6" /> New Event
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}
