
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import LeadDialog from '@/components/LeadDialog';
import { trackEvent } from '@/utils/googleAnalytics';

const VideoDialog: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(true);
  const isMobile = useIsMobile();
  const videoInteracted = useRef(false);

  // Track when the video dialog is closed
  const handleDialogOpenChange = (open: boolean) => {
    if (!open && dialogOpen) {
      // User is closing the dialog
      if (!videoInteracted.current) {
        // If user hasn't interacted with the video yet, show the lead form
        setShowLeadForm(true);
        // Track video closed without watching
        trackEvent("video_exit_without_watching", {
          event_category: "Engagement",
          event_label: "Demo Video Exit"
        });
      }
    }
    setDialogOpen(open);
  };

  // Handle video interaction
  const handleVideoInteraction = () => {
    videoInteracted.current = true;
    trackEvent("video_interaction", {
      event_category: "Engagement",
      event_label: "Demo Video Interaction"
    });
  };

  return (
    <>
      <DialogContent 
        className={`${isMobile ? 'w-[95vw] max-w-[95vw]' : 'sm:max-w-[900px]'} p-0 bg-transparent border-0`}
        onInteractOutside={() => handleDialogOpenChange(false)}
        onOpenAutoFocus={(e) => {
          e.preventDefault(); // Prevent auto focusing elements inside the dialog
        }}
      >
        <DialogTitle className="sr-only">Watch Demo Video</DialogTitle>
        <div className="video-container relative w-full aspect-video bg-black/90">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader className="w-8 h-8 animate-spin text-blue-primary" />
            </div>
          )}
          <iframe
            src="https://www.youtube.com/embed/5QWLpAUv6r8?autoplay=0"
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title="Demo Video"
            loading="lazy"
            style={{
              border: 'none',
              opacity: isLoading ? 0 : 1,
              transition: 'opacity 0.3s ease-in-out'
            }}
            onLoad={() => setIsLoading(false)}
            onClick={handleVideoInteraction}
            onPlay={handleVideoInteraction}
            allowFullScreen
          />
        </div>
      </DialogContent>

      {/* Lead form dialog shown when exiting video */}
      <LeadDialog
        isOpen={showLeadForm}
        onOpenChange={setShowLeadForm}
        title="Get Your Free MT5 Bot Source Code"
        description="Enter your details below to receive our free MT5 bot source code immediately to your inbox."
        source="video_exit"
        leadMagnet="free_mt5_bot_source_code"
        buttonText="Send Me The Bot Code"
      />
    </>
  );
};

export default VideoDialog;
