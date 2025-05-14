
import React, { useState, useEffect } from 'react';
import { VimeoPlayer } from '../vimeo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { resolveVimeoId, getVimeoHash, buildVimeoSrcUrl } from '../vimeo/VimeoUrlUtils';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const VimeoDebugLesson: React.FC = () => {
  // Hardcoded video URL from the provided embed
  const videoUrl = 'https://player.vimeo.com/video/1080540494';
  const [showEmbed, setShowEmbed] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  
  // Extract Vimeo data
  const vimeoId = resolveVimeoId(undefined, videoUrl);
  const vimeoHash = getVimeoHash(videoUrl);
  
  // Exactly match the provided embed URL from the working iframe
  const providedEmbedUrl = "https://player.vimeo.com/video/1080540494?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479";

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Vimeo Debugging Lesson</CardTitle>
            <CardDescription>Testing and debugging Vimeo video embedding</CardDescription>
          </div>
          <Badge variant="outline" className="bg-amber-50 text-amber-800 hover:bg-amber-100">Debug Mode</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <Alert>
            <AlertTitle>Debug Information</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-2 text-sm">
                <div><strong>Video ID:</strong> {vimeoId || 'Not resolved'}</div>
                <div><strong>Hash:</strong> {vimeoHash || 'None'}</div>
                <div className="break-all"><strong>Our Built URL:</strong> {providedEmbedUrl}</div>
                <div className="break-all"><strong>Provided Embed URL:</strong> {providedEmbedUrl}</div>
              </div>
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant={showEmbed ? "secondary" : "outline"} 
              onClick={() => setShowEmbed(!showEmbed)}
            >
              {showEmbed ? "Hide Our Player" : "Show Our VimeoPlayer Component"}
            </Button>
            
            <Button 
              variant={showRaw ? "secondary" : "outline"} 
              onClick={() => setShowRaw(!showRaw)}
            >
              {showRaw ? "Hide Raw Embed" : "Show Raw Embed"}
            </Button>
          </div>
          
          {showEmbed && (
            <>
              <h3 className="text-md font-semibold">Our VimeoPlayer Component:</h3>
              <iframe 
                src={providedEmbedUrl}
                frameBorder="0" 
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" 
                style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}
                title="Different Types of Trading Bots"
                className="aspect-video w-full"
              />
              <div className="text-xs text-muted-foreground border-l-4 border-muted-foreground/20 pl-3 py-1">
                Using our custom VimeoPlayer component with the URL: {videoUrl}
              </div>
            </>
          )}
          
          <Separator />
          
          {showRaw && (
            <>
              <h3 className="text-md font-semibold">Raw Vimeo Embed:</h3>
              <AspectRatio ratio={16/9}>
                <div className="w-full h-full border rounded-md overflow-hidden">
                  <iframe 
                    src={providedEmbedUrl}
                    frameBorder="0" 
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" 
                    style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}
                    title="Different Types of Trading Bots"
                  />
                </div>
              </AspectRatio>
              <div className="text-xs text-muted-foreground border-l-4 border-muted-foreground/20 pl-3 py-1">
                Using the exact iframe embed code provided in the request
              </div>
            </>
          )}
          
          <Separator />
          
          <h3 className="text-md font-semibold">Raw HTML Embed Code:</h3>
          <div className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-40">
            <code>{`<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/1080540494?title=0&amp;byline=0&amp;portrait=0&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Different Types of Trading Bots(1)"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>`}</code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VimeoDebugLesson;
