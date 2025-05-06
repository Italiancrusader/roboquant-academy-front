
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Unlock } from 'lucide-react';
import { trackEvent } from '@/utils/googleAnalytics';
import { useNavigate } from 'react-router-dom';

// Define interface for YouTube player
interface YouTubePlayer {
  getCurrentTime: () => number;
  getDuration: () => number;
  addEventListener: (event: string, listener: (e: any) => void) => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: {
      Player: new (id: string, options: any) => YouTubePlayer;
      PlayerState: {
        PLAYING: number;
        ENDED: number;
      };
    };
  }
}

const VSL = () => {
  const [watched, setWatched] = useState(false);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const navigate = useNavigate();
  
  // Load YouTube iframe API
  useEffect(() => {
    // Create script element
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    
    // Callback when API is ready
    window.onYouTubeIframeAPIReady = () => {
      const newPlayer = new window.YT.Player('ytplayer', {
        events: {
          'onStateChange': onStateChange
        }
      });
      setPlayer(newPlayer);
    };
    
    // Append script to document
    document.head.appendChild(tag);
    
    return () => {
      window.onYouTubeIframeAPIReady = () => {};
    };
  }, []);
  
  // Handle player state changes
  const onStateChange = (e: any) => {
    if (e.data === window.YT.PlayerState.PLAYING && player) {
      const duration = player.getDuration();
      const gatePercentage = 0.5; // 50%
      const gateTime = duration * gatePercentage;
      
      // Check progress every second
      const interval = setInterval(() => {
        if (player && player.getCurrentTime() >= gateTime && !watched) {
          setWatched(true);
          clearInterval(interval);
          
          // Track VSL watch milestone
          trackEvent('vsl_50_percent', {
            event_category: 'Video',
            event_label: 'VSL 50% Complete'
          });
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  };

  // Navigate to book call page
  const handleBookCall = () => {
    navigate('/book-call');
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center gradient-text">
            How To Build Profitable Trading Bots (Without Code)
          </h1>
          
          <div className="bg-card rounded-lg overflow-hidden shadow-lg mb-8">
            <div className="aspect-video bg-black relative">
              <iframe 
                id="ytplayer"
                src="https://www.youtube-nocookie.com/embed/5QWLpAUv6r8?enablejsapi=1&rel=0"
                frameBorder="0" 
                allowFullScreen
                className="w-full h-full"
                title="RoboQuant VSL"
              ></iframe>
            </div>
          </div>
          
          {watched && (
            <div id="unlockBooking" className="animate-fade-in text-center">
              <h2 className="text-2xl font-bold mb-4">You've Qualified For A Strategy Call</h2>
              <p className="text-muted-foreground mb-8">
                Based on your survey answers and video completion, you're eligible to speak with our team and get personalized guidance.
              </p>
              
              <Button 
                onClick={handleBookCall}
                className="py-6 px-8 text-lg"
              >
                <Unlock className="mr-2 h-5 w-5" /> Book My Strategy Call
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default VSL;
