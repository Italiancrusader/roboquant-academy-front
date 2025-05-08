
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquarePlus, Loader2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import NewTicketDialog from './NewTicketDialog';
import { useNavigate } from 'react-router-dom';

interface Ticket {
  id: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
}

const TicketList = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('tickets')
          .select('*')
          .order('last_message_at', { ascending: false });
        
        if (error) throw error;
        
        setTickets(data || []);
      } catch (error: any) {
        toast({
          title: "Error loading tickets",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTickets();
    
    // Subscribe to real-time changes
    const ticketsChannel = supabase
      .channel('tickets-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tickets',
          filter: user?.id ? `user_id=eq.${user.id}` : undefined
        }, 
        (payload) => {
          fetchTickets();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(ticketsChannel);
    };
  }, [user]);
  
  const handleOpenTicket = (ticketId: string) => {
    navigate(`/support/ticket/${ticketId}`);
  };
  
  const renderStatusBadge = (status: string) => {
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Support Tickets</h2>
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          New Ticket
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : tickets.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">You don't have any support tickets yet</p>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline">
              Create Your First Ticket
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Card 
              key={ticket.id} 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleOpenTicket(ticket.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                    <CardDescription>
                      Created {formatDistanceToNow(new Date(ticket.created_at))} ago
                    </CardDescription>
                  </div>
                  {renderStatusBadge(ticket.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <div className="text-sm text-muted-foreground">
                  Last updated: {format(new Date(ticket.last_message_at), 'MMM d, yyyy h:mm a')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <NewTicketDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onTicketCreated={(newTicket) => {
          setTickets(prev => [newTicket, ...prev]);
          navigate(`/support/ticket/${newTicket.id}`);
        }}
      />
    </div>
  );
};

export default TicketList;
