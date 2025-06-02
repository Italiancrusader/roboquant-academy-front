
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Check, Calendar, UserPlus, MessageCircle } from 'lucide-react';
import { trackEvent } from '@/utils/googleAnalytics';
import { trackPurchase } from '@/utils/metaPixel';
import { trackPurchaseConversionsAPI } from '@/utils/metaConversionsApi';
import { Link } from 'react-router-dom';

const ThankYou = () => {
  useEffect(() => {
    // Track purchase completion
    trackEvent('sale_completed', {
      event_category: 'Payment',
      event_label: 'RoboQuant Academy Purchase',
      value: 1500
    });
    
    // Track Meta pixel purchase event (client-side)
    trackPurchase({
      value: 1500,
      currency: 'USD',
      content_name: 'RoboQuant Academy',
      content_type: 'product'
    });

    // Track Meta Conversions API purchase event (server-side)
    trackPurchaseConversionsAPI({
      value: 1500,
      currency: 'USD',
      userData: {
        // Note: In a real implementation, you'd get this from your user context or localStorage
        // For now, we'll send anonymous data - you can enhance this later
      },
      contentName: 'RoboQuant Academy',
      contentCategory: 'online_course',
    }).catch(error => {
      console.error('Failed to send Conversions API event:', error);
    });
  }, []);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full mb-6">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            Welcome to RoboQuant Academy!
          </h1>
          
          <p className="text-xl mb-12 text-muted-foreground">
            Your purchase was successful. You now have lifetime access to our program.
          </p>
          
          <div className="grid gap-8 md:grid-cols-3 mb-12">
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <UserPlus className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Create Account</h3>
              <p className="text-muted-foreground mb-4">
                Set up your login credentials to access all course materials
              </p>
              <Link to="/auth">
                <Button className="w-full">Create Account</Button>
              </Link>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Join Discord</h3>
              <p className="text-muted-foreground mb-4">
                Connect with other traders and get support from our team
              </p>
              <a href="https://discord.gg/7sU4DmvmpW" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full">Join Community</Button>
              </a>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sprint Dates</h3>
              <p className="text-muted-foreground mb-4">
                Check upcoming cohort start dates to begin your journey
              </p>
              <Link to="/dashboard">
                <Button variant="outline" className="w-full">View Calendar</Button>
              </Link>
            </div>
          </div>
          
          <div className="bg-card p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
            <ul className="space-y-4 text-left">
              <li className="flex">
                <Check className="mr-3 h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Check your email for your purchase receipt and welcome instructions</span>
              </li>
              <li className="flex">
                <Check className="mr-3 h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Create your account to access all course materials</span>
              </li>
              <li className="flex">
                <Check className="mr-3 h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Join our Discord community to connect with fellow traders</span>
              </li>
              <li className="flex">
                <Check className="mr-3 h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Schedule your first session using the Sprint calendar</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ThankYou;
