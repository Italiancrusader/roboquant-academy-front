
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from 'lucide-react';
import { DialogTrigger } from "@/components/ui/dialog";
import { useIsMobile } from '@/hooks/use-mobile';
import OptimizedImage from '@/components/OptimizedImage';
import { trackViewContent, trackInitiateCheckout } from '@/utils/metaPixel';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const HeroContent: React.FC<{ imageLoaded: boolean }> = ({ imageLoaded }) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();

  useEffect(() => {
    // Collect user data for enhanced tracking if available
    const userData = user ? {
      email: user.email,
      externalId: user.id,
    } : undefined;
    
    // Track ViewContent when hero section is loaded
    trackViewContent(
      'RoboQuant Academy Homepage', 
      'Landing Page', 
      undefined,
      userData
    );
  }, [user]);

  const scrollToPricing = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Collect user data for enhanced tracking if available
    const userData = user ? {
      email: user.email,
      externalId: user.id,
    } : undefined;
    
    // Track InitiateCheckout event with user data when clicking on Enroll Now
    trackInitiateCheckout(1500, 'USD', userData);
    
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If pricing section doesn't exist on this page, navigate to pricing page
      window.location.href = '/pricing';
    }
  };

  return (
    <div className="container mx-auto px-4 relative z-20 mt-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center min-h-[700px]">
        <div className="text-left max-w-[90%] sm:max-w-none py-8 sm:py-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Build & launch profitable trading bots — <span className="gradient-text">without writing code</span>.
          </h1>
          <p className="text-lg sm:text-xl max-w-xl mb-8 text-gray-200">
            Create, test and deploy algorithmic trading strategies that run 24/7 — even if you've never coded before.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="cta-button text-white text-base sm:text-lg py-6 px-8 w-full sm:w-auto"
              onClick={scrollToPricing}
            >
              Enroll Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="border-gray-300 text-white hover:text-white hover:bg-gray-700 text-base sm:text-lg py-6 px-8 w-full sm:w-auto"
              >
                <Play className="mr-2 h-5 w-5" /> Watch Demo
              </Button>
            </DialogTrigger>
          </div>
        </div>
        <div className="flex justify-center items-center lg:h-full py-4 sm:py-8 lg:py-0">
          <div className="flex items-center justify-center h-full">
            <OptimizedImage 
              alt="RoboQuant mobile app interface"
              className="w-full max-w-[480px] h-auto object-contain"
              style={{
                minHeight: isMobile ? '320px' : '500px',
                maxHeight: '600px',
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out',
                transform: 'translateY(0)',
              }}
              src="/lovable-uploads/fd0974dc-cbd8-4af8-b3c8-35c6a8182cf5.png"
              priority={true}
              width={480}
              height={960}
              onLoad={() => {
                console.log('Hero image loaded in component');
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
