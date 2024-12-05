/* eslint-disable @typescript-eslint/no-explicit-any */
import EventForms from '@/components/forms/EventForms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/drizzle/db';
import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import React from 'react';

export const revalidate = 0;

export default async function EditEventPage({
  params: { eventId },
}: {
  params: { eventId: string };
}) {
  const { userId, redirectToSignIn } = await auth();
  if (userId == null) redirectToSignIn();

  const event = await db.query.EventTable.findFirst({
    where: ({ id, clerkUserId }, { and, eq }) =>
      and(eq(id, eventId), eq(clerkUserId, userId)),
  });
  if (event == null) return notFound();

  console.log(event);
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Edit Event (#)</CardTitle>
      </CardHeader>
      <CardContent>
        <EventForms
          event={{ ...event, description: event.description || undefined }}
        />
      </CardContent>
    </Card>
  );
}
