
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { extractVimeoDuration } from '../utils/lessonFormUtils';
import { Loader } from 'lucide-react';

interface VideoUrlInputProps {
  videoUrl: string;
  onVideoUrlChange: (url: string) => void;
  onDurationExtracted: (duration: number) => void;
}

const VideoUrlInput = ({ videoUrl, onVideoUrlChange, onDurationExtracted }: VideoUrlInputProps) => {
  const [loading, setLoading] = useState(false);

  const handleExtractDuration = async () => {
    setLoading(true);
    try {
      const duration = await extractVimeoDuration(videoUrl);
      if (duration !== undefined) {
        onDurationExtracted(duration);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="grid gap-2">
      <Label htmlFor="videoUrl">Video URL (Vimeo)</Label>
      <div className="flex gap-2">
        <Input
          id="videoUrl"
          value={videoUrl}
          onChange={(e) => onVideoUrlChange(e.target.value)}
          placeholder="https://vimeo.com/123456789"
          className="flex-1"
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleExtractDuration}
          disabled={!videoUrl || !videoUrl.includes('vimeo.com') || loading}
        >
          {loading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : null}
          Get Duration
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Enter a Vimeo URL and click "Get Duration" to automatically fetch the video duration. If it fails, you can enter the duration manually.
      </p>
    </div>
  );
};

export default VideoUrlInput;
