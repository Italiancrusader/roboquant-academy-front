
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Download, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const NarrativePanel: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [narrative, setNarrative] = useState<string>('');
  
  const handleGenerateNarrative = async () => {
    setIsGenerating(true);
    
    try {
      // Mock metrics for demo - in a real app, these would come from your actual data
      const mockMetrics = {
        totalNetProfit: 12547.89,
        profitFactor: 3.35,
        expectedPayoff: 47.91,
        maxDrawdown: 15.3,
        sharpeRatio: 1.89,
        sortinoRatio: 2.34,
        calmarRatio: 1.12,
        tradesTotal: 262,
        winRate: 68.7,
        recoveryFactor: 3.67
      };

      const { data, error } = await supabase.functions.invoke('generate-narrative', {
        body: { metrics: mockMetrics }
      });

      if (error) throw error;
      
      setNarrative(data.narrative);
      toast({
        title: "Narrative generated",
        description: "Your strategy analysis has been generated successfully."
      });
    } catch (error) {
      console.error('Error generating narrative:', error);
      toast({
        title: "Generation failed",
        description: "There was an error generating the narrative. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(narrative);
    toast({
      title: "Copied to clipboard",
      description: "The narrative has been copied to your clipboard."
    });
  };
  
  const handleDownloadMarkdown = () => {
    const element = document.createElement('a');
    const file = new Blob([narrative], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = 'mt5_strategy_narrative.md';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Download started",
      description: "Your markdown file is being downloaded."
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">AI-Generated Strategy Analysis</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Get a professional analysis of your trading strategy with actionable insights.
        </p>
      </div>
      
      {!narrative ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click the button below to generate an in-depth analysis of your trading strategy using AI.
              </p>
              <div className="flex justify-end">
                <Button 
                  onClick={handleGenerateNarrative} 
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Analysis...
                    </>
                  ) : (
                    'Generate Strategy Analysis'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="prose prose-invert max-w-none bg-card p-6 rounded-lg">
            <div dangerouslySetInnerHTML={{ __html: narrative.replace(/\n/g, '<br />') }} />
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleCopyToClipboard}>
              <Copy className="mr-2 h-4 w-4" />
              Copy to Clipboard
            </Button>
            <Button onClick={handleDownloadMarkdown}>
              <Download className="mr-2 h-4 w-4" />
              Download as Markdown
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NarrativePanel;
