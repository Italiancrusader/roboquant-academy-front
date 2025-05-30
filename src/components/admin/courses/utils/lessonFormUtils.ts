
import { toast } from '@/components/ui/use-toast';
import { Lesson } from '@/types/courses';
import { resolveVimeoId } from '@/components/vimeo/VimeoUrlUtils';

export const extractVimeoDuration = async (videoUrl: string): Promise<number | undefined> => {
  if (!videoUrl || !videoUrl.includes('vimeo.com')) {
    return undefined;
  }
  
  // Extract Vimeo ID using our utility function
  const vimeoId = resolveVimeoId(undefined, videoUrl);
  if (!vimeoId) {
    toast({
      title: "Error",
      description: "Could not extract Vimeo ID from URL",
      variant: "destructive",
    });
    return undefined;
  }
  
  try {
    // Fetch video metadata from Vimeo oEmbed API
    const response = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Vimeo data: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.duration) {
      // Convert seconds to minutes and round to whole number
      const durationMinutes = Math.round(data.duration / 60);
      toast({
        title: "Video duration fetched",
        description: `Duration set to ${durationMinutes} minutes`,
      });
      return durationMinutes;
    }
  } catch (error) {
    console.error('Error fetching Vimeo duration:', error);
    toast({
      title: "Error",
      description: "Failed to fetch video duration from Vimeo",
      variant: "destructive",
    });
  }
  
  return undefined;
};

export const validateLessonData = (title: string): boolean => {
  if (!title.trim()) {
    toast({
      title: "Error",
      description: "Lesson title is required",
      variant: "destructive",
    });
    return false;
  }
  
  return true;
};
