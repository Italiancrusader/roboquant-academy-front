
export interface Profile {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

export interface Ticket {
  id: string;
  subject: string;
  status: string;
  created_at: string;
  last_message_at: string;
  user_id: string;
  profile: Profile | null;
  unreadCount: number;
}

export type TicketStatus = 'open' | 'waiting' | 'closed';
