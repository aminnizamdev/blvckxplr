
import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  subMessage?: string;
}

const EmptyState = ({ message, subMessage }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-border rounded-lg bg-card/50 h-[300px]">
      <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">{message}</h3>
      {subMessage && (
        <p className="text-sm text-muted-foreground mt-2">{subMessage}</p>
      )}
    </div>
  );
};

export default EmptyState;
