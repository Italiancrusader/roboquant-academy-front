
import React, { useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VideoDialog from '@/components/hero/VideoDialog';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';

const SimpleLanding: React.FC = () => {
  const [videoOpen, setVideoOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="flex-grow flex flex-col items-center justify-center py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
            RoboQuant Academy
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-2xl mx-auto">
            Build Profitable Trading Bots Without Writing a Single Line of Code
          </p>
          
          {/* Video Section */}
          <div className="mb-12">
            <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
              <DialogTrigger asChild>
                <div className="relative max-w-3xl mx-auto rounded-xl overflow-hidden shadow-2xl cursor-pointer group">
                  {/* Video Thumbnail with Play Button Overlay */}
                  <div className="aspect-video bg-black/20 relative">
                    <img 
                      src="https://img.youtube.com/vi/5QWLpAUv6r8/maxresdefault.jpg" 
                      alt="Watch our intro video" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                      <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Play className="h-10 w-10 text-white fill-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </DialogTrigger>
              
              <VideoDialog videoId="5QWLpAUv6r8" />
            </Dialog>
            
            <p className="mt-4 text-muted-foreground">
              Watch how we help traders automate their strategies without coding
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              className="bg-primary text-white px-8 py-6 text-lg font-semibold hover:bg-primary/90 w-full sm:w-auto"
              onClick={() => window.location.href = "https://whop.com/checkout/plan_Yc4zPlVFCJKxb?d2c=true"}
            >
              Join the Academy <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              className="px-8 py-6 text-lg font-semibold w-full sm:w-auto"
              onClick={() => {
                const dialog = document.querySelector('[role="dialog"]');
                if (dialog) {
                  (dialog as HTMLElement).click();
                }
                setVideoOpen(true);
              }}
            >
              Learn More <Play className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Key Benefits Section */}
      <div className="bg-card/50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Why Traders Choose RoboQuant</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">No Coding Required</h3>
              <p className="text-muted-foreground">Build sophisticated trading bots without writing a single line of code. Our visual interface makes it easy.</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Proven Strategies</h3>
              <p className="text-muted-foreground">Access battle-tested trading strategies that have been proven to work in diverse market conditions.</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">24/7 Automation</h3>
              <p className="text-muted-foreground">Let your bots trade for you around the clock, capturing opportunities even while you sleep.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Final CTA */}
      <div className="bg-gradient-to-r from-blue-900/50 to-teal-900/50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Automate Your Trading?</h2>
          <p className="text-lg mb-6 text-muted-foreground">Join RoboQuant Academy today and start building profitable trading bots without code.</p>
          
          <Button 
            className="bg-primary text-white px-8 py-6 text-lg font-semibold hover:bg-primary/90"
            onClick={() => window.location.href = "https://whop.com/checkout/plan_Yc4zPlVFCJKxb?d2c=true"}
          >
            Join the Academy <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <footer className="w-full py-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} RoboQuant Academy. All rights reserved.
      </footer>
    </div>
  );
};

export default SimpleLanding;
