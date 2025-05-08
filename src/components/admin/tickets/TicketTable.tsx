
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { MessageCircle, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ticket } from './types';

interface TicketTableProps {
  tickets: Ticket[];
  isLoading: boolean;
}

const TicketTable = ({ tickets, isLoading }: TicketTableProps) => {
  const navigate = useNavigate();
  
  const handleViewTicket = (ticketId: string) => {
    navigate(`/support/ticket/${ticketId}`);
  };
  
  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      await supabase
        .from('tickets')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);
      
      toast({
        title: `Ticket ${newStatus}`,
        description: `The ticket status has been updated to ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating ticket",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const getUserName = (profile: { first_name: string | null; last_name: string | null; email?: string } | null) => {
    if (!profile) return 'Unknown User';
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return profile.email || 'Unknown User';
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'open':
        return <Badge className="bg-green-500">Open</Badge>;
      case 'closed':
        return <Badge variant="outline">Closed</Badge>;
      case 'waiting':
        return <Badge className="bg-amber-500">Waiting</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  if (isLoading) {
    return null; // Loading state is handled by the parent component
  }
  
  if (tickets.length === 0) {
    return null; // Empty state is handled by the parent component
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell className="font-mono text-xs">
                {ticket.id.substring(0, 8)}...
              </TableCell>
              <TableCell onClick={() => handleViewTicket(ticket.id)} className="max-w-[200px]">
                <div className="flex items-center">
                  <span className="truncate font-medium">{ticket.subject}</span>
                  {ticket.unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {ticket.unreadCount} new
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{getUserName(ticket.profile)}</TableCell>
              <TableCell>{getStatusBadge(ticket.status)}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(ticket.last_message_at), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewTicket(ticket.id)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewTicket(ticket.id)}>
                        View details
                      </DropdownMenuItem>
                      {ticket.status !== 'open' && (
                        <DropdownMenuItem onClick={() => handleUpdateStatus(ticket.id, 'open')}>
                          Mark as open
                        </DropdownMenuItem>
                      )}
                      {ticket.status !== 'waiting' && (
                        <DropdownMenuItem onClick={() => handleUpdateStatus(ticket.id, 'waiting')}>
                          Mark as waiting
                        </DropdownMenuItem>
                      )}
                      {ticket.status !== 'closed' && (
                        <DropdownMenuItem onClick={() => handleUpdateStatus(ticket.id, 'closed')}>
                          Close ticket
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TicketTable;
