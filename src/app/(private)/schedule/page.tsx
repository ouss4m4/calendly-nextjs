import ScheduleForm from '@/components/forms/scheduleForm';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { db } from '@/drizzle/db';
import { auth } from '@clerk/nextjs/server';
import React from 'react';

export default async function SchedulePage() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) redirectToSignIn();

  const schedule = db.query.ScheduleTable.findFirst({
    where: ({ id, clerkUserId }, { eq }) => eq(clerkUserId, id),
    with: { availabilities: true },
  });

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <ScheduleForm schedule={schedule} />
      </CardContent>
    </Card>
  );
}
