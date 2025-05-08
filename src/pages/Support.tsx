
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TicketList from '@/components/support/TicketList';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Support = () => {
  const { user, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-20 flex-grow">
        <h1 className="text-3xl font-bold gradient-text mb-2">Support Center</h1>
        <p className="text-muted-foreground mb-8">Get help from our team with any questions you have</p>

        {!user && !isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-lg border">
            <h2 className="text-2xl font-semibold mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              You need to sign in to your account to view your support tickets or create new ones.
            </p>
            <Button asChild>
              <Link to="/auth">
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <TicketList />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Support;
