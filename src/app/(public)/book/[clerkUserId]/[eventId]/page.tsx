import { MeetingForm } from '@/components/forms/MeetingForm';
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
import { getValidTimesFromSchedule } from '@/lib/getValidTimesFromSchedule';
import { clerkClient } from '@clerk/nextjs/server';
import {
  addMonths,
  eachMinuteOfInterval,
  endOfDay,
  roundToNearestMinutes,
} from 'date-fns';
import Link from 'next/link';

import { notFound } from 'next/navigation';

export const revalidate = 0;
export default async function BookEventPage({
  params: { clerkUserId, eventId },
}: {
  params: {
    clerkUserId: string;
    eventId: string;
  };
}) {
  const event = await db.query.EventTable.findFirst({
    where: (columns, { eq, and }) =>
      and(
        eq(clerkUserId, columns.clerkUserId),
        eq(columns.id, eventId),
        eq(columns.isActive, true)
      ),
  });

  if (event == null) {
    return notFound();
  }

  const calendarUser = await clerkClient().then((client) =>
    client.users.getUser(clerkUserId)
  );
  const startDate = roundToNearestMinutes(new Date(), {
    nearestTo: 15,
    roundingMethod: 'ceil',
  });
  const endDate = endOfDay(addMonths(startDate, 2));

  const validTimes = await getValidTimesFromSchedule(
    eachMinuteOfInterval({ start: startDate, end: endDate }, { step: 15 }),
    { clerkUserId, durationInMinutes: event.durationInMinutes }
  );

  if (validTimes.length == 0) {
    return <NoTimeSlots event={event} calendarUser={calendarUser} />;
  }

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle>
          Book {event.name} with {calendarUser.fullName}
        </CardTitle>
        {event.description && (
          <CardDescription>{event.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <MeetingForm
          validTimes={validTimes}
          eventId={event.id}
          clerkUserId={clerkUserId}
        />
      </CardContent>
    </Card>
  );
}

function NoTimeSlots({
  event,
  calendarUser,
}: {
  event: { name: string; description: string | null };
  calendarUser: { id: string; fullName: string | null };
}) {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>
          Book {event.name} with {calendarUser.fullName}
        </CardTitle>
        {event.description && (
          <CardDescription>{event.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {calendarUser.fullName} is currently booked up. Please check back later
        or choose a shorter event.
      </CardContent>
      <CardFooter>
        <Button asChild>
          <Link href={`/book/${calendarUser.id}`}>Choose Another Event</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
