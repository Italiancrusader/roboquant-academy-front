
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Download, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const NarrativePanel: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [narrative, setNarrative] = useState<string>('');
  
  const handleGenerateNarrative = () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key to generate a narrative.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate API call for demo purposes
    setTimeout(() => {
      const mockNarrative = `
# MT5 Strategy Performance Executive Summary

## 1. Overall Profitability & Risk

* **Net Profit**: $12,547.89 with a strong profit factor of 3.35
* **Return Metrics**: The strategy delivered consistent returns with a Sharpe ratio of 1.89 and Sortino ratio of 2.34
* **Drawdown Control**: Maximum drawdown was contained at 15.3% of equity, with quick recovery periods (recovery factor: 3.67)
* **Trade Efficiency**: 262 total trades with 68.7% win rate and average profit of $47.89 per trade

The strategy demonstrates a robust risk-reward profile with returns significantly outperforming the inherent volatility. The Calmar ratio of 1.12 indicates acceptable returns relative to maximum drawdown, though there's room for improvement in drawdown management.

## 2. Statistical Robustness & Edge Stability

* **Return Distribution**: Moderate positive skew (0.73) with acceptable kurtosis (2.84)
* **Time-Series Consistency**: Rolling 30-trade Sharpe ratio shows stable performance across different market conditions
* **Monte Carlo Simulation**: 95% confidence interval suggests drawdown unlikely to exceed 19.7% in future iterations
* **Trade Duration Edge**: Statistical significance in the 4-6 hour trade duration bracket (p < 0.05)

Bootstrap analysis of 1000 iterations confirms the strategy's edge is statistically significant and not the result of random chance. The positive expectancy remains consistent when applying various sampling methods.

## 3. Notable Strengths & Weaknesses

### Strengths:
* Strong performance during trending market conditions
* Excellent win rate on short positions (72.4% vs 64.1% for longs)
* Consistent weekly performance with minimal variation between weekdays
* Low correlation to overall market movements (0.23)

### Weaknesses:
* Underperformance during high volatility periods (VIX > 25)
* Excessive drawdowns during January and October (seasonal pattern)
* Trade duration outliers negatively impact profitability
* Limited edge during Asian trading hours

The strategy shows particular strength when trading short positions in trending markets, but demonstrates vulnerability during extreme volatility environments.

## 4. Actionable Improvement Recommendations

* **Entry Refinement**: Implement volatility filter to avoid entries when daily ATR exceeds 1.5x 20-day average
* **Risk Management**: Consider dynamic position sizing based on volatility-adjusted stop distances
* **Exit Optimization**: Implement scaled exits to capture larger moves; current single-exit approach leaves money on the table
* **Time Filters**: Restrict trading during Asian session hours where edge is statistically insignificant
* **Seasonal Adjustments**: Reduce position size by 30% during historically weak months (January, October)

Further parameter optimization should focus on exit mechanisms and drawdown control rather than entry conditions, which already demonstrate statistical edge.
`;
      
      setNarrative(mockNarrative);
      setIsGenerating(false);
    }, 3000);
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
        <h2 className="text-xl font-semibold">LLM-Generated Strategy Narrative</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Get an AI-powered professional analysis of your trading strategy with actionable insights.
        </p>
      </div>
      
      {!narrative ? (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="api-key" className="text-sm font-medium">
                OpenAI API Key (never stored)
              </label>
              <Textarea
                id="api-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key to generate a narrative"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Your API key is never stored and is only used for this request.
                Alternatively, you can set the OPENAI_API_KEY environment variable.
              </p>
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleGenerateNarrative} 
                disabled={isGenerating || !apiKey}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Strategy Narrative'
                )}
              </Button>
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
