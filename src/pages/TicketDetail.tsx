
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TicketChat from '@/components/support/TicketChat';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const TicketDetail = () => {
  const { user, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-20 flex-grow">
        {!user && !isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-lg border">
            <h2 className="text-2xl font-semibold mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              You need to sign in to your account to view support ticket details.
            </p>
            <Button asChild>
              <Link to="/auth">
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <TicketChat />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default TicketDetail;
