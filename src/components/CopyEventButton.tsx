'use client';

import { Copy, CopyCheck, CopyX } from 'lucide-react';
import { Button, ButtonProps } from './ui/button';
import { useState } from 'react';

type CopyState = 'idle' | 'copied' | 'error';

export default function CopyEventButton({
  eventId,
  clerkUserId,
  ...buttonsProps
}: Omit<ButtonProps, 'children' | 'onClick'> & {
  eventId: string;
  clerkUserId: string;
}) {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const CopyIcon = getCopyIcon(copyState);
  return (
    <Button
      {...buttonsProps}
      onClick={() =>
        navigator.clipboard
          .writeText(`${location.origin}/book/${clerkUserId}/${eventId}`)
          .then(() => {
            setCopyState('copied');
            setTimeout(() => {
              setCopyState('idle');
            }, 2000);
          })
          .catch(() => {
            setCopyState('error');
            setTimeout(() => {
              setCopyState('idle');
            }, 2000);
          })
      }
    >
      <CopyIcon className="mr-2 size-4" />
      {getChildren(copyState)}
    </Button>
  );
}

function getCopyIcon(copyState: CopyState) {
  switch (copyState) {
    case 'idle':
      return Copy;
    case 'copied':
      return CopyCheck;
    case 'error':
      return CopyX;
    default:
      return Copy;
      break;
  }
}

function getChildren(copyState: CopyState) {
  switch (copyState) {
    case 'idle':
      return 'Copy Link';
    case 'copied':
      return 'Copied!';
    case 'error':
      return 'Error!';
    default:
      break;
  }
}
