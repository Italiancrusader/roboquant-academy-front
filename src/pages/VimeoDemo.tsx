
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { VimeoPlayer } from '@/components/vimeo';

const VimeoDemo = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Vimeo Demo Page</h1>
          
          <div className="bg-card rounded-lg overflow-hidden shadow-lg border border-border mb-8">
            <VimeoPlayer
              videoUrl="https://vimeo.com/1080540494"
              controls={true}
              dnt={true}
            />
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
