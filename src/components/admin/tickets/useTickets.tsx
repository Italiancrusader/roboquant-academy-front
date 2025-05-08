
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Ticket, Profile } from './types';

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Debug log function to track our data safely
  const debugLog = (message: string, data: any) => {
    console.log(`[TicketsManager Debug] ${message}:`, data);
  };

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // First get all tickets
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('tickets')
          .select('*')
          .order('last_message_at', { ascending: false });
        
        if (ticketsError) throw ticketsError;
        
        debugLog("Raw tickets data", ticketsData);
        
        // Instead of using the RPC function which might have permission issues,
        // let's directly join with profiles table to get user information
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email');
          
        if (profilesError) throw profilesError;
        
        debugLog("Raw profiles data", profilesData);
        
        // Create a map of profiles by user_id for easy lookup
        const profilesMap: Record<string, Profile> = {};
        profilesData?.forEach(profile => {
          if (profile && typeof profile === 'object' && 'id' in profile) {
            profilesMap[profile.id] = {
              first_name: profile.first_name || null,
              last_name: profile.last_name || null,
              email: profile.email
            };
          }
        });
        
        debugLog("Profiles map created", profilesMap);
        
        // For each ticket, count unread messages and add profile info
        const ticketsWithUnread = await Promise.all((ticketsData || []).map(async (ticket) => {
          const { count, error: countError } = await supabase
            .from('ticket_messages')
            .select('*', { count: 'exact', head: true })
            .eq('ticket_id', ticket.id)
            .eq('is_admin', false)
            .is('read_at', null);
          
          const userProfile = profilesMap[ticket.user_id] || null;
          debugLog(`Profile for user ${ticket.user_id}`, userProfile);
          
          return {
            ...ticket,
            profile: userProfile,
            unreadCount: count || 0
          };
        }));
        
        debugLog("Tickets with profiles and unread counts", ticketsWithUnread);
        
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
    debugLog("Filter criteria changed", { searchTerm, statusFilter });
    
    let filtered = [...tickets];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      debugLog("Filtering by search term", term);
      
      // Log how many tickets have null profiles
      const nullProfileCount = tickets.filter(t => t.profile === null).length;
      debugLog(`Number of tickets with null profiles`, nullProfileCount);
      
      filtered = filtered.filter(ticket => {
        // First check if the subject matches (this doesn't involve profile)
        if (ticket.subject.toLowerCase().includes(term)) {
          return true;
        }
        
        // If no profile, we can only match on subject
        if (!ticket.profile) {
          return false;
        }
        
        // Safely check each profile property with optional chaining and nullish checks
        const emailMatches = ticket.profile?.email?.toLowerCase().includes(term) || false;
        const firstNameMatches = ticket.profile?.first_name?.toLowerCase().includes(term) || false;
        const lastNameMatches = ticket.profile?.last_name?.toLowerCase().includes(term) || false;
        
        return emailMatches || firstNameMatches || lastNameMatches;
      });
    }
    
    if (statusFilter) {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }
    
    debugLog("Filtered tickets result", { 
      total: tickets.length,
      filtered: filtered.length
    });
    
    setFilteredTickets(filtered);
  }, [searchTerm, statusFilter, tickets]);

  return {
    tickets: filteredTickets,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    isSearchFiltered: Boolean(searchTerm || statusFilter)
  };
};
