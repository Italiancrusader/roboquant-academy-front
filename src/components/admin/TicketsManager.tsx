import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { Loader2, Search, MoreHorizontal, MessageCircle } from 'lucide-react';

interface Profile {
  first_name: string | null;
  last_name: string | null;
  email?: string; // Make email optional since it might not be in the profiles table
}

interface Ticket {
  id: string;
  subject: string;
  status: string;
  created_at: string;
  last_message_at: string;
  user_id: string;
  profile: Profile | null;
  unreadCount: number;
}

const TicketsManager = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // First get all tickets
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('tickets')
          .select('*')
          .order('last_message_at', { ascending: false });
        
        if (ticketsError) throw ticketsError;
        
        // Instead of using the RPC function which might have permission issues,
        // let's directly join with profiles table to get user information
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email');
          
        if (profilesError) throw profilesError;
        
        // Create a map of profiles by user_id for easy lookup
        const profilesMap: Record<string, Profile> = {};
        profilesData?.forEach(profile => {
          if (profile && typeof profile === 'object' && 'id' in profile) {
            profilesMap[profile.id] = {
              first_name: profile.first_name,
              last_name: profile.last_name,
              email: profile.email
            };
          }
        });
        
        // For each ticket, count unread messages and add profile info
        const ticketsWithUnread = await Promise.all((ticketsData || []).map(async (ticket) => {
          const { count, error: countError } = await supabase
            .from('ticket_messages')
            .select('*', { count: 'exact', head: true })
            .eq('ticket_id', ticket.id)
            .eq('is_admin', false)
            .is('read_at', null);
          
          return {
            ...ticket,
            profile: profilesMap[ticket.user_id] || null,
            unreadCount: count || 0
          };
        }));
        
        setTickets(ticketsWithUnread);
        setFilteredTickets(ticketsWithUnread);
      } catch (error: any) {
        toast({
          title: "Error loading tickets",
          description: error.message,
          variant: "destructive",
        });
        console.error("Error fetching tickets:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTickets();
    
    // Set up realtime subscription
    const ticketsChannel = supabase
      .channel('admin-tickets-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tickets'
        }, 
        () => {
          fetchTickets();
        }
      )
      .subscribe();
    
    const messagesChannel = supabase
      .channel('admin-messages-changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_messages'
        },
        () => {
          fetchTickets();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(ticketsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, []);
  
  // Filter tickets when search term or status filter changes
  useEffect(() => {
    let filtered = [...tickets];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(ticket => 
        ticket.subject.toLowerCase().includes(term) ||
        (ticket.profile && ticket.profile.email && ticket.profile.email.toLowerCase().includes(term)) ||
        (ticket.profile && ticket.profile.first_name && ticket.profile.first_name.toLowerCase().includes(term)) ||
        (ticket.profile && ticket.profile.last_name && ticket.profile.last_name.toLowerCase().includes(term))
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }
    
    setFilteredTickets(filtered);
  }, [searchTerm, statusFilter, tickets]);
  
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
      
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
      ));
      
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
  
  const getUserName = (profile: Profile | null) => {
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Tickets</CardTitle>
        <CardDescription>
          Manage user support requests and communications
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets by subject or user..." 
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-row gap-2">
            <Button 
              variant={statusFilter === null ? "default" : "outline"} 
              onClick={() => setStatusFilter(null)}
              size="sm"
            >
              All
            </Button>
            <Button 
              variant={statusFilter === 'open' ? "default" : "outline"} 
              onClick={() => setStatusFilter('open')}
              size="sm"
            >
              Open
            </Button>
            <Button 
              variant={statusFilter === 'waiting' ? "default" : "outline"} 
              onClick={() => setStatusFilter('waiting')}
              size="sm"
            >
              Waiting
            </Button>
            <Button 
              variant={statusFilter === 'closed' ? "default" : "outline"} 
              onClick={() => setStatusFilter('closed')}
              size="sm"
            >
              Closed
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchTerm || statusFilter ? 'No tickets match your filters' : 'No support tickets yet'}
          </div>
        ) : (
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
                {filteredTickets.map((ticket) => (
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
        )}
      </CardContent>
    </Card>
  );
};

export default TicketsManager;
