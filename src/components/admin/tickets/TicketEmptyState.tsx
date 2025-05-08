
import React from 'react';

interface TicketEmptyStateProps {
  isSearchFiltered: boolean;
}

const TicketEmptyState = ({ isSearchFiltered }: TicketEmptyStateProps) => {
  return (
    <div className="text-center py-12 text-muted-foreground">
      {isSearchFiltered ? 'No tickets match your filters' : 'No support tickets yet'}
    </div>
  );
};

export default TicketEmptyState;
