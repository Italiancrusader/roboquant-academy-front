
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { extractVimeoDuration } from '../utils/lessonFormUtils';

interface VideoUrlInputProps {
  videoUrl: string;
  onVideoUrlChange: (url: string) => void;
  onDurationExtracted: (duration: number) => void;
}

const VideoUrlInput = ({ videoUrl, onVideoUrlChange, onDurationExtracted }: VideoUrlInputProps) => {
  const handleExtractDuration = async () => {
    const duration = await extractVimeoDuration(videoUrl);
    if (duration !== undefined) {
      onDurationExtracted(duration);
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
          disabled={!videoUrl || !videoUrl.includes('vimeo.com')}
        >
          Get Duration
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Enter a Vimeo URL and click "Get Duration" to automatically fetch the video duration
      </p>
    </div>
  );
};

export default VideoUrlInput;
