import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Code, BarChart3, Users, CheckCircle, ArrowRight, DollarSign, Target, Trophy, FileCode, Euro } from 'lucide-react';
const RealResults = () => {
  const [activeTab, setActiveTab] = useState('performance');
  const performanceStats = [{
    label: 'Student Success Rate',
    value: '87%',
    icon: <Trophy className="w-5 h-5" />
  }, {
    label: 'Average Monthly Return',
    value: '+12.4%',
    icon: <TrendingUp className="w-5 h-5" />
  }, {
    label: 'Strategies Deployed',
    value: '500+',
    icon: <Target className="w-5 h-5" />
  }, {
    label: 'Active Trading Bots',
    value: '1,200+',
    icon: <BarChart3 className="w-5 h-5" />
  }];
  const testimonialResults = [{
    name: "dmarks2585",
    result: "+$3,454 (3.45% return)",
    timeframe: "68 trades over 3 months",
    winRate: "73.53%",
    strategy: "EMA Crossover Bot"
  }, {
    name: "TraderPilot_EA",
    result: "+$14,200 profit",
    timeframe: "Live trading account",
    winRate: "84%",
    strategy: "MNQT 15min No Wick Strategy"
  }];
  return <section className="py-20 px-4 bg-gradient-to-br from-background via-secondary/5 to-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-primary/5 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-primary/5 rounded-full filter blur-3xl"></div>
      
      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <Badge variant="outline" className="mb-4 text-sm px-4 py-2 border-blue-primary/30 text-blue-primary">
            Real Student Results
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            See What Our Students Actually Build & Earn
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Don't just take our word for it. Here are real screenshots, live performance data, 
            and actual code from students who've transformed their trading with RoboQuant.
          </p>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 animate-fade-in-up animation-delay-200">
          {performanceStats.map((stat, index) => <Card key={index} className="p-6 text-center bg-card/50 backdrop-blur-sm border-border/50 hover:border-blue-primary/30 transition-all duration-300">
              <div className="flex justify-center mb-3 text-blue-primary">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>)}
        </div>

        {/* Main Content Tabs */}
        <div className="animate-fade-in-up animation-delay-300">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full max-w-4xl mx-auto mb-12">
              <TabsTrigger value="performance" className="text-sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="earnings" className="text-sm">
                <Euro className="w-4 h-4 mr-2" />
                Earnings
              </TabsTrigger>
              <TabsTrigger value="community" className="text-sm">
                <Users className="w-4 h-4 mr-2" />
                Community
              </TabsTrigger>
              <TabsTrigger value="code" className="text-sm">
                <Code className="w-4 h-4 mr-2" />
                Real Code
              </TabsTrigger>
              <TabsTrigger value="freecode" className="text-sm">
                <FileCode className="w-4 h-4 mr-2" />
                Free Code
              </TabsTrigger>
              <TabsTrigger value="platform" className="text-sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Platform
              </TabsTrigger>
            </TabsList>

            {/* Performance Results Tab */}
            <TabsContent value="performance" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Live Trading Results */}
                <Card className="p-6 bg-card/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                    <h3 className="text-xl font-semibold">Live Trading Performance</h3>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500">Verified</Badge>
                  </div>
                  <div className="space-y-4">
                    <img src="/lovable-uploads/08298171-85bd-4aa4-aafd-34ef4f3a6f35.png" alt="MNQT Strategy Performance - +$3,454 profit with 73.53% win rate" className="w-full rounded-lg border border-border/50" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total P&L:</span>
                        <span className="ml-2 font-semibold text-green-500">+$3,454.00</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Win Rate:</span>
                        <span className="ml-2 font-semibold">73.53%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Trades:</span>
                        <span className="ml-2 font-semibold">68</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Profit Factor:</span>
                        <span className="ml-2 font-semibold">2.109</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* MyFXBook Verified Results */}
                <Card className="p-6 bg-card/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="w-6 h-6 text-blue-primary" />
                    <h3 className="text-xl font-semibold">MyFXBook Verified</h3>
                    <Badge variant="outline" className="border-blue-primary/30 text-blue-primary">Third-Party Verified</Badge>
                  </div>
                  <div className="space-y-4">
                    <img src="/lovable-uploads/3074f886-3a5f-4ea4-9003-d8deaeb98a8a.png" alt="MyFXBook verified trading results showing consistent profitability" className="w-full rounded-lg border border-border/50" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Gain:</span>
                        <span className="ml-2 font-semibold text-green-500">+514.06%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Drawdown:</span>
                        <span className="ml-2 font-semibold">48.44%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Balance:</span>
                        <span className="ml-2 font-semibold">$614,102.15</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Live Update:</span>
                        <span className="ml-2 font-semibold text-green-500">Active</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* TradingView Results */}
              <Card className="p-6 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-6 h-6 text-teal-primary" />
                  <h3 className="text-xl font-semibold">TradingView Strategy Results</h3>
                  <Badge variant="secondary" className="bg-teal-primary/10 text-teal-primary">Backtested</Badge>
                </div>
                <img src="/lovable-uploads/2d9186ef-9e5e-42f3-80b8-1c53cc234070.png" alt="TradingView strategy backtest showing systematic trading approach with clear entry/exit signals" className="w-full rounded-lg border border-border/50" />
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Starting Capital:</span>
                    <span className="ml-2 font-semibold">$100,000</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Return:</span>
                    <span className="ml-2 font-semibold text-green-500">3.45%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Win Rate:</span>
                    <span className="ml-2 font-semibold">73.53%</span>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Earnings Tab */}
            <TabsContent value="earnings" className="space-y-8">
              <Card className="p-6 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Euro className="w-6 h-6 text-green-500" />
                  <h3 className="text-xl font-semibold">Turn Your Skills Into Income</h3>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500">Real Invoice</Badge>
                </div>
                <div className="space-y-6">
                  <img alt="Real invoice showing €500 payment for software development services - demonstrating earning potential" className="w-full max-w-2xl mx-auto rounded-lg border border-border/50" src="/lovable-uploads/6f3fa911-a1b7-4196-8b30-018201f4844f.png" />
                  <div className="text-center space-y-4">
                    <h4 className="text-2xl font-bold text-green-500">€500 for Software Development</h4>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      This is a real invoice from one of our students who now charges clients for custom trading bot development. 
                      Learn the skills that companies pay premium rates for.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                        <div className="text-2xl font-bold text-green-500">€50-150/hr</div>
                        <div className="text-sm text-muted-foreground">Typical Hourly Rate</div>
                      </Card>
                      <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                        <div className="text-2xl font-bold text-blue-500">€1,000-5,000</div>
                        <div className="text-sm text-muted-foreground">Per Project Range</div>
                      </Card>
                      <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                        <div className="text-2xl font-bold text-purple-500">Unlimited</div>
                        <div className="text-sm text-muted-foreground">Earning Potential</div>
                      </Card>
                    </div>
                    <div className="mt-6 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        💡 <strong>Pro Tip:</strong> Many students start freelancing within 3-6 months of completing the course, 
                        often earning back their investment on their first project.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Community Tab */}
            <TabsContent value="community" className="space-y-8">
              <Card className="p-6 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-purple-500" />
                  <h3 className="text-xl font-semibold">Student Community & Success Stories</h3>
                  <Badge variant="secondary" className="bg-purple-500/10 text-purple-500">Live Discord</Badge>
                </div>
                <img src="/lovable-uploads/092e779f-ca42-4a2e-9752-a237970a22a0.png" alt="Discord community showing students sharing their strategy development and backtest results" className="w-full rounded-lg border border-border/50" />
                <div className="mt-6 space-y-4">
                  {testimonialResults.map((testimonial, index) => <div key={index} className="border-l-4 border-blue-primary pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <Badge variant="outline" className="text-green-500 border-green-500/30">
                          {testimonial.result}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{testimonial.timeframe}</p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Strategy:</span> {testimonial.strategy} | 
                        <span className="text-muted-foreground"> Win Rate:</span> {testimonial.winRate}
                      </p>
                    </div>)}
                </div>
              </Card>
            </TabsContent>

            {/* Code Tab */}
            <TabsContent value="code" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* MetaTrader EA Code */}
                <Card className="p-6 bg-card/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Code className="w-6 h-6 text-green-500" />
                    <h3 className="text-xl font-semibold">Student-Built Expert Advisor</h3>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500">MT5/MT4 Ready</Badge>
                  </div>
                  <img src="/lovable-uploads/16032624-d005-48c6-b40a-e0d46408b1ee.png" alt="MetaTrader Expert Advisor code showing scalping strategy with risk management parameters" className="w-full rounded-lg border border-border/50" />
                  <div className="mt-4 space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Strategy:</span> Scalping Expert Advisor</p>
                    <p><span className="text-muted-foreground">Features:</span> Risk Management, Time Filters, Take Profit/Stop Loss</p>
                    <p><span className="text-muted-foreground">Compatible:</span> MT4/MT5 platforms</p>
                  </div>
                </Card>

                {/* PineScript Code */}
                <Card className="p-6 bg-card/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Code className="w-6 h-6 text-blue-primary" />
                    <h3 className="text-xl font-semibold">PineScript Strategy</h3>
                    <Badge variant="outline" className="border-blue-primary/30 text-blue-primary">TradingView</Badge>
                  </div>
                  <img src="/lovable-uploads/a0cbe4a3-1779-4021-b72c-382396c6d71e.png" alt="PineScript code for RoboQuant setup strategy with detailed explanations and parameters" className="w-full rounded-lg border border-border/50" />
                  <div className="mt-4 space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Strategy:</span> Pattern-based Trading Setup</p>
                    <p><span className="text-muted-foreground">Features:</span> Day Filter, Stop Loss Offset, Risk Management</p>
                    <p><span className="text-muted-foreground">Platform:</span> TradingView PineScript v5</p>
                  </div>
                </Card>
              </div>

              {/* Live Trading Results */}
              <Card className="p-6 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-6 h-6 text-yellow-500" />
                  <h3 className="text-xl font-semibold">Live MetaTrader Results</h3>
                  <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">MT5 Account</Badge>
                </div>
                <img src="/lovable-uploads/2a682adf-28b8-4b9e-b062-a5acfc9b04b1.png" alt="Live MetaTrader trading account showing real trades and profit/loss history" className="w-full rounded-lg border border-border/50" />
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Account Balance:</span>
                    <span className="ml-2 font-semibold">$614,102.15</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Credit:</span>
                    <span className="ml-2 font-semibold">$0.00</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Profit:</span>
                    <span className="ml-2 font-semibold text-green-500">$514,102.15</span>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Free Code Tab */}
            <TabsContent value="freecode" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Community Shared EA */}
                <Card className="p-6 bg-card/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <FileCode className="w-6 h-6 text-emerald-500" />
                    <h3 className="text-xl font-semibold">Gold Breakout EA - Free Download</h3>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">Community Shared</Badge>
                  </div>
                  <img alt="Discord community member Gabriel sharing Gold breakout Expert Advisor source code and backtest results" className="w-full rounded-lg border border-border/50" src="/lovable-uploads/5f277fde-bc29-4465-8f06-7f61f9f343c5.png" />
                  <div className="mt-4 space-y-3">
                    <div className="bg-emerald-500/10 p-3 rounded-lg">
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        📁 Gabriel shared: "Gold Breakout EA" + source code
                      </p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Strategy:</span> Gold Breakout Detection</p>
                      <p><span className="text-muted-foreground">Includes:</span> .ex5 file, source code, backtest report</p>
                      <p><span className="text-muted-foreground">Platform:</span> MetaTrader 5</p>
                      <p><span className="text-muted-foreground">Performance:</span> Strong upward trend in backtests</p>
                    </div>
                  </div>
                </Card>

                {/* Strategy Development Workflow */}
                <Card className="p-6 bg-card/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-6 h-6 text-blue-500" />
                    <h3 className="text-xl font-semibold">Pinescript free source code</h3>
                    <Badge variant="outline" className="border-blue-500/30 text-blue-500">Tradingview ready</Badge>
                  </div>
                  <img alt="TradingView interface showing strategy optimization and backtesting workflow with multiple charts and performance metrics" className="w-full rounded-lg border border-border/50" src="/lovable-uploads/01bdbe2d-bcd6-4d9e-8d6d-3fd8623714b3.png" />
                  <div className="mt-4 space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Platform:</span> TradingView Strategy Development</p>
                    <p><span className="text-muted-foreground">Process:</span> Optimization, Backtesting, Parameter Tuning</p>
                    <p><span className="text-muted-foreground">Output:</span> Validated trading algorithms</p>
                    <p><span className="text-muted-foreground">Next Step:</span> Deploy to live trading platforms</p>
                  </div>
                </Card>
              </div>

              {/* Backtest Results */}
              <Card className="p-6 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-6 h-6 text-purple-500" />
                  <h3 className="text-xl font-semibold">Community Backtest Results</h3>
                  <Badge variant="secondary" className="bg-purple-500/10 text-purple-500">Shared Results</Badge>
                </div>
                <img src="/lovable-uploads/1db84306-2667-4e34-b98f-aefc881b060d.png" alt="Detailed backtest results showing consistent upward performance curve with detailed statistics" className="w-full rounded-lg border border-border/50" />
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Trend:</span>
                    <span className="ml-2 font-semibold text-green-500">Strong Upward</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Consistency:</span>
                    <span className="ml-2 font-semibold">High</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Drawdown:</span>
                    <span className="ml-2 font-semibold">Minimal</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Community:</span>
                    <span className="ml-2 font-semibold text-blue-500">Verified</span>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    💎 <strong>Free Access:</strong> All community-shared strategies and source codes are available 
                    to course members at no additional cost. Learn from real implementations!
                  </p>
                </div>
              </Card>
            </TabsContent>

            {/* Platform Tab */}
            <TabsContent value="platform" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Course Platform */}
                <Card className="p-6 bg-card/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <h3 className="text-xl font-semibold">Learning Platform</h3>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500">Interactive</Badge>
                  </div>
                  <img src="/lovable-uploads/b134c8c1-d7a7-48a1-84e0-55320c8bb248.png" alt="RoboQuant Academy learning platform showing course modules and progress tracking" className="w-full rounded-lg border border-border/50" />
                  <div className="mt-4 space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Features:</span> Video Lessons, Progress Tracking, Resources</p>
                    <p><span className="text-muted-foreground">Modules:</span> 8 comprehensive trading modules</p>
                    <p><span className="text-muted-foreground">Access:</span> Lifetime access to all content</p>
                  </div>
                </Card>

                {/* Community Platform */}
                <Card className="p-6 bg-card/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-6 h-6 text-purple-500" />
                    <h3 className="text-xl font-semibold">Community Hub</h3>
                    <Badge variant="outline" className="border-purple-500/30 text-purple-500">Whop.com</Badge>
                  </div>
                  <img src="/lovable-uploads/bfafb034-810b-4230-a98b-7bb00b2c9c5d.png" alt="Whop.com community platform showing course access and student interaction" className="w-full rounded-lg border border-border/50" />
                  <div className="mt-4 space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Platform:</span> Professional community management</p>
                    <p><span className="text-muted-foreground">Features:</span> Course access, chat, resources</p>
                    <p><span className="text-muted-foreground">Progress:</span> Track completion across all modules</p>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 animate-fade-in-up animation-delay-400">
          <Card className="p-8 bg-gradient-to-r from-blue-primary/10 to-teal-primary/10 border-blue-primary/20">
            <h3 className="text-2xl font-bold mb-4">Ready to Build Your Own Profitable Trading Bot?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join hundreds of successful students who've transformed their trading with our proven methodology. 
              Start building your automated trading system today.
            </p>
            <Button size="lg" className="cta-button">
              Start Learning Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Card>
        </div>
      </div>
    </section>;
};
export default RealResults;