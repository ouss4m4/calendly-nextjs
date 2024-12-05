// import { Button } from '@/components/ui/button';
import CopyEventButton from '@/components/CopyEventButton';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { db } from '@/drizzle/db';
import { formatEventDescription } from '@/lib/formatters';
import { cn } from '@/lib/utils';
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
        <div className="grid grid-cols-[repeat(auto-fill,minmix(400px,1fr))] gap-4">
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
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

type EventCardProps = {
  id: string;
  isActive: boolean;
  name: string;
  description: string | null;
  durationInMinutes: number;
  clerkUserId: string;
};

function EventCard({
  id,
  isActive,
  name,
  description,
  durationInMinutes,
  clerkUserId,
}: EventCardProps) {
  return (
    <Card className={cn('flex flex-col', !isActive && 'border-secondary')}>
      <CardHeader className={cn(!isActive && 'opacity-50')}>
        <CardTitle>{name}</CardTitle>
        <CardDescription>
          {formatEventDescription(durationInMinutes)}
        </CardDescription>
      </CardHeader>
      {description != null && (
        <CardContent className={cn(!isActive && 'opacity-50')}>
          {description}
        </CardContent>
      )}
      <CardFooter className="mt-auto flex justify-end gap-2">
        {isActive && (
          <CopyEventButton
            variant="outline"
            eventId={id}
            clerkUserId={clerkUserId}
          />
        )}

        <Button asChild>
          <Link href={`/events/${id}/edit`}>EDIT</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
