import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Loader2 } from 'lucide-react';
import { trackEvent } from '@/utils/googleAnalytics';
import { useNavigate } from 'react-router-dom';

interface HeroContentProps {
  imageLoaded: boolean;
  onOpenVideoDialog: () => void;
}

const HeroContent: React.FC<HeroContentProps> = ({ imageLoaded, onOpenVideoDialog }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleApplyNow = async () => {
    setIsLoading(true);
    try {
      // Track event
      trackEvent('hero_apply_clicked', {
        event_category: 'Hero',
        event_label: 'Hero Apply Now Button'
      });
      
      // Navigate to quiz
      navigate('/quiz');
    } catch (error) {
      console.error('Error navigating to quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto relative z-10 px-4 sm:px-6 pt-24 pb-16 sm:pt-40 sm:pb-32">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 gradient-text animate-fade-in-up">
            Build Profitable Trading Bots Without Writing Code
          </h1>
          <p className="text-lg sm:text-xl mb-8 text-white/90 animate-fade-in-up animation-delay-200">
            Create, test, and deploy algorithmic trading strategies for forex, 
            stocks, and crypto — even if you're not a programmer.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up animation-delay-300">
            <Button 
              size="lg" 
              className="cta-button py-6 px-8 text-lg font-semibold"
              onClick={handleApplyNow}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Apply Now <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white py-6 px-8 text-lg font-semibold"
              onClick={onOpenVideoDialog}
            >
              <Play className="mr-2 h-5 w-5" /> Watch Demo
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <div className="relative z-10 animate-fade-in-up animation-delay-400">
            <img 
              src="/lovable-uploads/84929246-b3ad-45e9-99c1-497718c3a71c.png"
              alt="RoboQuant Dashboard" 
              className={`w-full rounded-xl shadow-2xl border border-white/10 transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          </div>
          <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-blue-primary/30 rounded-full filter blur-3xl"></div>
          <div className="absolute -top-6 -left-6 w-48 h-48 bg-teal-primary/30 rounded-full filter blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
