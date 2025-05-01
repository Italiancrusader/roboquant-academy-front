
import React, { useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ArrowRight } from 'lucide-react';

const CostCalculator: React.FC = () => {
  const { ref, isVisible } = useIntersectionObserver();
  const [botCount, setBotCount] = useState(3);
  
  const devCostPerBot = 1250; // Average cost to hire a developer for one bot
  const courseCost = 1500; // UPDATED course cost from $2,000 to $1,500
  const totalSavings = (botCount * devCostPerBot) - courseCost;
  
  return (
    <section 
      id="calculator" 
      className="section-padding bg-background"
      ref={ref as React.RefObject<HTMLElement>}
    >
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            <span className="gradient-text">Calculate Your Savings</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            See how much you'll save by building bots yourself vs. hiring developers.
          </p>
        </div>
        
        <div className={`max-w-2xl mx-auto ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="glass-card p-8 md:p-10 rounded-2xl border border-border/20">
            <div className="mb-8">
              <label className="block text-lg font-semibold mb-2 text-foreground">Number of trading bots you plan to build:</label>
              <div className="flex items-center gap-4">
                <div className="w-full">
                  <Slider 
                    min={1}
                    max={10}
                    step={1}
                    value={[botCount]}
                    onValueChange={(value) => setBotCount(value[0])}
                    className="py-4"
                  />
                </div>
                <div className="w-12 h-12 flex items-center justify-center bg-accent/50 rounded-lg font-bold text-xl text-foreground">
                  {botCount}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-card p-6 rounded-xl border border-border/20">
                <div className="text-gray-400 mb-1">Developer Cost</div>
                <div className="text-2xl font-bold text-foreground">
                  ${(botCount * devCostPerBot).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  (${devCostPerBot.toLocaleString()} per bot × {botCount} bots)
                </div>
              </div>
              
              <div className="bg-card p-6 rounded-xl border border-border/20">
                <div className="text-gray-400 mb-1">Your Investment</div>
                <div className="text-2xl font-bold text-foreground">
                  ${courseCost.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  (one-time course payment)
                </div>
              </div>
            </div>
            
            <div className="bg-accent/30 p-6 rounded-xl border border-blue-primary/20 mb-8">
              <div className="text-lg text-gray-300 mb-2">Your Total Savings</div>
              <div className="text-4xl font-bold gradient-text">
                ${totalSavings.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400 mt-2">
                Plus, all future bots you build cost you $0 in development fees
              </div>
            </div>
            
            <div className="text-center">
              <a href="#testimonials">
                <Button className="cta-button text-white py-5 px-8">
                  See Success Stories <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CostCalculator;
