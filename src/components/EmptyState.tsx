
import React from 'react';
import { Inbox, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  message: string;
  subMessage?: string;
  isLoading?: boolean;
  buttonText?: string;
  onAction?: () => void;
}

const EmptyState = ({ 
  message, 
  subMessage, 
  isLoading = false,
  buttonText,
  onAction
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-border rounded-lg bg-card/50 h-[300px]">
      {isLoading ? (
        <Loader2 className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
      ) : (
        <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
      )}
      
      <h3 className="text-lg font-medium">{message}</h3>
      
      {subMessage && (
        <p className="text-sm text-muted-foreground mt-2 max-w-md">{subMessage}</p>
      )}
      
      {buttonText && onAction && (
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={onAction}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
