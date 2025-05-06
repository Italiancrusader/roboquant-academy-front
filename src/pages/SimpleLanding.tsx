
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SimpleLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
          RoboQuant Academy
        </h1>
        
        <p className="text-xl mb-8 text-muted-foreground">
          Build Trading Bots Without Code
        </p>
        
        <Button 
          className="bg-primary text-white px-8 py-6 text-lg font-semibold hover:bg-primary/90"
          onClick={() => window.location.href = "https://whop.com/checkout/plan_Yc4zPlVFCJKxb?d2c=true"}
        >
          Join the Academy <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
      
      <footer className="fixed bottom-0 w-full py-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} RoboQuant Academy. All rights reserved.
      </footer>
    </div>
  );
};

export default SimpleLanding;
