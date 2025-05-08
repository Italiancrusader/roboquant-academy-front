
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ArrowLeft, Send, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface Message {
  id: string;
  ticket_id: string;
  user_id: string;
  is_admin: boolean;
  message: string;
  created_at: string;
  read_at: string | null;
}

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

const TicketChat = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { user } = useAuth();
  const { isAdmin } = useAdminStatus(user?.id);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showCloseAlert, setShowCloseAlert] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!ticketId || !user) return;
    
    const fetchTicketAndMessages = async () => {
      try {
        // Get the ticket
        const { data: ticketData, error: ticketError } = await supabase
          .from('tickets')
          .select('*')
          .eq('id', ticketId)
          .single();
        
        if (ticketError) throw ticketError;
        
        // Only allow access if user owns the ticket or is admin
        if (ticketData.user_id !== user.id && !isAdmin) {
          toast({
            title: "Access denied",
            description: "You don't have permission to view this ticket",
            variant: "destructive",
          });
          navigate('/support');
          return;
        }
        
        setTicket(ticketData);
        
        // Get the messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('ticket_messages')
          .select('*')
          .eq('ticket_id', ticketId)
          .order('created_at', { ascending: true });
        
        if (messagesError) throw messagesError;
        
        setMessages(messagesData || []);
        
        // Get profiles for user IDs in messages
        const userIds = [...new Set(messagesData?.map(m => m.user_id) || [])];
        if (userIds.length) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, avatar_url')
            .in('id', userIds);
          
          if (profilesError) throw profilesError;
          
          const profilesMap = (profilesData || []).reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {} as Record<string, Profile>);
          
          setProfiles(profilesMap);
        }
        
        // Mark messages as read if admin viewing user messages
        if (isAdmin) {
          const unreadMessages = messagesData?.filter(m => !m.read_at && !m.is_admin) || [];
          if (unreadMessages.length > 0) {
            await Promise.all(unreadMessages.map(async message => {
              await supabase
                .from('ticket_messages')
                .update({ read_at: new Date().toISOString() })
                .eq('id', message.id);
            }));
          }
        }
        
      } catch (error: any) {
        toast({
          title: "Error loading ticket",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTicketAndMessages();
    
    // Subscribe to real-time updates for messages
    const messagesChannel = supabase
      .channel('messages-changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${ticketId}`
        },
        async (payload: any) => {
          // Check if the change is a new message and not one we just sent
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new;
            
            // Get the profile if we don't have it
            if (!profiles[newMessage.user_id]) {
              const { data } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, avatar_url')
                .eq('id', newMessage.user_id)
                .single();
              
              if (data) {
                setProfiles(prev => ({
                  ...prev,
                  [data.id]: data
                }));
              }
            }
            
            // Add the new message
            setMessages(prev => [...prev, newMessage]);
            
            // Mark as read if admin viewing
            if (isAdmin && !newMessage.is_admin && !newMessage.read_at) {
              await supabase
                .from('ticket_messages')
                .update({ read_at: new Date().toISOString() })
                .eq('id', newMessage.id);
            }
          }
        }
      )
      .subscribe();
    
    // Subscribe to updates for the ticket
    const ticketChannel = supabase
      .channel('ticket-changes')
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tickets',
          filter: `id=eq.${ticketId}`
        },
        (payload: any) => {
          setTicket(payload.new);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(ticketChannel);
    };
  }, [ticketId, user, navigate, isAdmin]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !ticket) return;
    
    setIsSending(true);
    try {
      const { error: messageError } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticket.id,
          user_id: user.id,
          message: newMessage.trim(),
          is_admin: isAdmin
        });
      
      if (messageError) throw messageError;
      
      // Update the last message timestamp on ticket
      const { error: ticketError } = await supabase
        .from('tickets')
        .update({
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: ticket.status === 'closed' ? 'open' : ticket.status
        })
        .eq('id', ticket.id);
      
      if (ticketError) throw ticketError;
      
      setNewMessage('');
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const closeTicket = async () => {
    if (!ticket) return;
    
    try {
      await supabase
        .from('tickets')
        .update({
          status: 'closed',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticket.id);
      
      setShowCloseAlert(false);
      
      toast({
        title: "Ticket closed",
        description: "The support ticket has been closed"
      });
    } catch (error: any) {
      toast({
        title: "Error closing ticket",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const reopenTicket = async () => {
    if (!ticket) return;
    
    try {
      await supabase
        .from('tickets')
        .update({
          status: 'open',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticket.id);
      
      toast({
        title: "Ticket reopened",
        description: "The support ticket has been reopened"
      });
    } catch (error: any) {
      toast({
        title: "Error reopening ticket",
        description: error.message,
        variant: "destructive",
      });
    }
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
  
  const getUserName = (userId: string) => {
    const profile = profiles[userId];
    if (profile && (profile.first_name || profile.last_name)) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return isAdmin && userId === user?.id ? 'Support Team' : 'User';
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Ticket Not Found</h2>
        <p className="text-muted-foreground mb-6">The requested ticket could not be found or you don't have permission to view it.</p>
        <Button onClick={() => navigate('/support')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Support
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-120px)]">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate('/support')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{ticket.subject}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getStatusBadge(ticket.status)}
              <span>Created on {format(new Date(ticket.created_at), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>
        
        {/* Ticket actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Actions</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {ticket.status === 'closed' ? (
              <DropdownMenuItem onClick={reopenTicket}>Reopen Ticket</DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => setShowCloseAlert(true)}>Close Ticket</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Separator className="mb-4" />
      
      {/* Messages area - scrollable */}
      <div className="flex-1 overflow-y-auto mb-4 pr-1">
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isUserMessage = message.user_id === user?.id && !isAdmin;
            const isAdminMessage = message.is_admin || (isAdmin && message.user_id === user?.id);
            
            return (
              <div 
                key={message.id} 
                className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] ${
                    isUserMessage 
                      ? 'bg-primary text-primary-foreground rounded-tl-lg rounded-tr-lg rounded-bl-lg' 
                      : isAdminMessage 
                        ? 'bg-secondary text-secondary-foreground rounded-tl-lg rounded-tr-lg rounded-br-lg' 
                        : 'bg-muted rounded-tl-lg rounded-tr-lg rounded-br-lg'
                  } p-4`}
                >
                  <div className="flex justify-between items-center mb-1 gap-4">
                    <span className="font-medium text-sm">
                      {isAdminMessage ? 'Support Team' : getUserName(message.user_id)}
                    </span>
                    <span className="text-xs opacity-70">
                      {format(new Date(message.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{message.message}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input area */}
      <div className="mt-auto">
        {ticket.status === 'closed' ? (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <p>This ticket is closed. You can reopen it to continue the conversation.</p>
                <Button onClick={reopenTicket} variant="outline" size="sm" className="mt-1">
                  Reopen Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="resize-none"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && newMessage.trim()) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              className="shrink-0 self-end mb-1"
              onClick={handleSendMessage} 
              disabled={!newMessage.trim() || isSending}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        )}
      </div>
      
      {/* Close ticket alert dialog */}
      <AlertDialog open={showCloseAlert} onOpenChange={setShowCloseAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Support Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close this support ticket? You can reopen it later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={closeTicket}>Close Ticket</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TicketChat;
