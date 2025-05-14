
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const VimeoDemo = () => {
  // Load the Vimeo Player API script when the component mounts
  useEffect(() => {
    // Check if the script is already loaded
    if (!document.querySelector('script[src="https://player.vimeo.com/api/player.js"]')) {
      const script = document.createElement('script');
      script.src = "https://player.vimeo.com/api/player.js";
      script.async = true;
      document.body.appendChild(script);
      
      // Clean up the script when component unmounts
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Vimeo Demo Page</h1>
          
          <div className="bg-card rounded-lg overflow-hidden shadow-lg border border-border mb-8">
            <div style={{padding:"56.25% 0 0 0", position:"relative"}}>
              <iframe 
                src="https://player.vimeo.com/video/1080540494?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479" 
                style={{position:"absolute", top:0, left:0, width:"100%", height:"100%"}} 
                frameBorder="0" 
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" 
                title="Different Types of Trading Bots(1)"
              ></iframe>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-4">
              This is a demo page showing an embedded Vimeo video player.
            </p>
            <p className="text-muted-foreground">
              Video ID: 1080540494
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default VimeoDemo;
