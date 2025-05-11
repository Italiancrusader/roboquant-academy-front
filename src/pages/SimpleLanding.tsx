import React, { useState } from 'react';
import { ArrowRight, Play, Star } from 'lucide-react';
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
      
      {/* Testimonials Section */}
      <div className="py-16 px-4 bg-gradient-to-b from-background to-card/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">What Our Members Say</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Hear from traders who have transformed their trading with RoboQuant Academy
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-card p-6 rounded-lg shadow-lg border border-border/50 flex flex-col">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="italic text-muted-foreground mb-4">
                "After trying multiple trading courses, RoboQuant was the only one that delivered real results. I've automated my strategy and now trade with confidence while working my full-time job."
              </p>
              <div className="mt-auto pt-4 flex items-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 overflow-hidden flex items-center justify-center mr-3">
                  <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Michael T." className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-semibold">Michael T.</h4>
                  <p className="text-sm text-muted-foreground">Forex Trader, New York</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-card p-6 rounded-lg shadow-lg border border-border/50 flex flex-col">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="italic text-muted-foreground mb-4">
                "The no-code approach was a game changer for me. I was able to implement complex strategies that I thought were only possible with programming knowledge. My returns have improved by 28% since joining."
              </p>
              <div className="mt-auto pt-4 flex items-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 overflow-hidden flex items-center justify-center mr-3">
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Sarah K." className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-semibold">Sarah K.</h4>
                  <p className="text-sm text-muted-foreground">Crypto Trader, London</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-card p-6 rounded-lg shadow-lg border border-border/50 flex flex-col">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="italic text-muted-foreground mb-4">
                "I was skeptical at first, but the step-by-step training and community support made all the difference. Now I have three different bots running across different markets 24/7."
              </p>
              <div className="mt-auto pt-4 flex items-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 overflow-hidden flex items-center justify-center mr-3">
                  <img src="https://randomuser.me/api/portraits/men/67.jpg" alt="David L." className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-semibold">David L.</h4>
                  <p className="text-sm text-muted-foreground">Stock Trader, Singapore</p>
                </div>
              </div>
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
