import { toast } from '@/components/ui/use-toast';
import { Lesson } from '@/types/courses';

export const extractVimeoDuration = async (videoUrl: string): Promise<number | undefined> => {
  if (!videoUrl || !videoUrl.includes('vimeo.com')) {
    return undefined;
  }
  
  // Extract Vimeo ID from URL
  const vimeoIdMatch = videoUrl.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  if (!vimeoIdMatch || !vimeoIdMatch[1]) {
    return undefined;
  }
  
  const vimeoId = vimeoIdMatch[1];
  
  try {
    // Fetch video metadata from Vimeo oEmbed API
    const response = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Vimeo data: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.duration) {
      // Convert seconds to minutes (but keep as a number)
      const durationMinutes = parseFloat((data.duration / 60).toFixed(2));
      toast({
        title: "Video duration fetched",
        description: `Duration set to ${Math.floor(data.duration / 60)}m ${data.duration % 60}s`,
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
