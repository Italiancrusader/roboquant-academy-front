
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
    const data = await response.json();
    
    if (data.duration) {
      const durationMinutes = data.duration / 60;
      toast({
        title: "Video duration fetched",
        description: `Duration set to ${Math.floor(data.duration / 60)}m ${data.duration % 60}s`,
      });
      return durationMinutes;
    }
  } catch (error) {
    console.error('Error fetching Vimeo duration:', error);
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

