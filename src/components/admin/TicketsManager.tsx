
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  TicketFilters, 
  TicketTable, 
  TicketEmptyState, 
  TicketLoadingState,
  useTickets 
} from './tickets';

const TicketsManager = () => {
  const { 
    tickets, 
    isLoading, 
    searchTerm, 
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    isSearchFiltered
  } = useTickets();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Tickets</CardTitle>
        <CardDescription>
          Manage user support requests and communications
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <TicketFilters 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />
        
        {isLoading ? (
          <TicketLoadingState />
        ) : tickets.length === 0 ? (
          <TicketEmptyState isSearchFiltered={isSearchFiltered} />
        ) : (
          <TicketTable tickets={tickets} isLoading={isLoading} />
        )}
      </CardContent>
    </Card>
  );
};

export default TicketsManager;
