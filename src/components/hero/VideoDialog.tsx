
import React from 'react';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import VimeoPlayer from "@/components/VimeoPlayer";

interface VideoDialogProps {
  videoId: string;
}

const VideoDialog: React.FC<VideoDialogProps> = ({ videoId }) => {
  return (
    <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden">
      <div className="relative aspect-video w-full">
        <VimeoPlayer 
          videoId={videoId}
          autoplay
          responsive
        />
      </div>
    </DialogContent>
  );
};

export default VideoDialog;
