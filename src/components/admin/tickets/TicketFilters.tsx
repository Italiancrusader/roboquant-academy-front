
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TicketFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string | null;
  onStatusChange: (status: string | null) => void;
}

const TicketFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange
}: TicketFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tickets by subject or user..." 
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex flex-row gap-2">
        <Button 
          variant={statusFilter === null ? "default" : "outline"} 
          onClick={() => onStatusChange(null)}
          size="sm"
        >
          All
        </Button>
        <Button 
          variant={statusFilter === 'open' ? "default" : "outline"} 
          onClick={() => onStatusChange('open')}
          size="sm"
        >
          Open
        </Button>
        <Button 
          variant={statusFilter === 'waiting' ? "default" : "outline"} 
          onClick={() => onStatusChange('waiting')}
          size="sm"
        >
          Waiting
        </Button>
        <Button 
          variant={statusFilter === 'closed' ? "default" : "outline"} 
          onClick={() => onStatusChange('closed')}
          size="sm"
        >
          Closed
        </Button>
      </div>
    </div>
  );
};

export default TicketFilters;
