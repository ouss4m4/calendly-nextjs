import EventForms from '@/components/forms/EventForms';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import React from 'react';

export default function NewEventPage() {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>New Event</CardTitle>
      </CardHeader>
      <CardContent>
        <EventForms />
      </CardContent>
    </Card>
  );
}
