
import React, { useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ArrowRight } from 'lucide-react';

const CostCalculator: React.FC = () => {
  const { ref, isVisible } = useIntersectionObserver();
  const [botCount, setBotCount] = useState(3);
  
  // Cost calculation
  const devCostPerBot = 3500; // Average cost to hire a developer for one bot
  const courseCost = 1497; // Course cost
  const totalSavings = (botCount * devCostPerBot) - courseCost;
  
  return (
    <section 
      id="calculator" 
      className="section-padding"
      ref={ref as React.RefObject<HTMLElement>}
    >
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Calculate Your Savings</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how much you'll save by building bots yourself vs. hiring developers.
          </p>
        </div>
        
        <div className={`max-w-2xl mx-auto ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-gray-200">
            <div className="mb-8">
              <label className="block text-lg font-semibold mb-2">Number of trading bots you plan to build:</label>
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
                <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg font-bold text-xl">
                  {botCount}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="text-gray-500 mb-1">Developer Cost</div>
                <div className="text-2xl font-bold text-gray-800">
                  ${(botCount * devCostPerBot).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  (${devCostPerBot.toLocaleString()} per bot × {botCount} bots)
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="text-gray-500 mb-1">Your Investment</div>
                <div className="text-2xl font-bold text-gray-800">
                  ${courseCost.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  (one-time course payment)
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-robo-blue/10 to-robo-aqua/10 p-6 rounded-xl border border-robo-blue/20 mb-8">
              <div className="text-lg text-gray-700 mb-2">Your Total Savings</div>
              <div className="text-4xl font-bold gradient-text">
                ${totalSavings.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 mt-2">
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
