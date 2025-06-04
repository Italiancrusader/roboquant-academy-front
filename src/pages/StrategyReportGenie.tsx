
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, TrendingUp, BarChart3, AlertTriangle, DollarSign, Calendar, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDropzone } from 'react-dropzone';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ModernReportDashboard from '@/components/mt5reportgenie/ModernReportDashboard';
import LeadCaptureDialog from '@/components/mt5reportgenie/LeadCaptureDialog';
import { parseTradeData } from '@/utils/mt5parser';
import { trackEvent } from '@/utils/googleAnalytics';
import { trackViewContent, trackCustomEvent } from '@/utils/metaPixel';
import { trackViewContentConversionsAPI, trackCustomEventConversionsAPI } from '@/utils/metaConversionsApi';
import type { TradeData, ReportData } from '@/types/mt5reportgenie';

const StrategyReportGenie = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Track ViewContent event for Strategy Report Genie page
    trackViewContent({
      content_name: 'Strategy Report Genie',
      content_category: 'tool',
      content_type: 'analysis_tool'
    });

    // Track Meta Conversions API ViewContent event
    trackViewContentConversionsAPI({
      userData: {},
      contentName: 'Strategy Report Genie',
      contentCategory: 'tool',
    }).catch(error => {
      console.error('Failed to send ViewContent Conversions API event:', error);
    });
  }, []);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFileUpload(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/html': ['.htm', '.html'],
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    
    try {
      console.log('📊 Processing file:', file.name);
      
      // Track file upload event
      trackEvent('file_upload', {
        event_category: 'Tool Usage',
        event_label: 'MT5 Report Upload',
        file_type: file.type
      });

      // Track Meta Pixel custom event for file upload
      trackCustomEvent('FileUpload', {
        content_name: 'MT5 Report Analysis',
        content_category: 'tool_usage'
      });

      // Track Meta Conversions API custom event for file upload
      trackCustomEventConversionsAPI({
        eventName: 'FileUpload',
        userData: {},
        customData: {
          contentName: 'MT5 Report Analysis',
          contentCategory: 'tool_usage',
        },
      }).catch(error => {
        console.error('Failed to send FileUpload Conversions API event:', error);
      });

      const tradeData = await parseTradeData(file);
      
      if (tradeData.length === 0) {
        throw new Error('No valid trade data found in the file');
      }

      console.log(`✅ Parsed ${tradeData.length} trades successfully`);
      
      const processedData: ReportData = {
        trades: tradeData,
        summary: calculateSummary(tradeData),
        fileName: file.name,
        uploadDate: new Date()
      };

      setReportData(processedData);
      
      // Show lead capture dialog after successful upload if not already captured
      if (!leadCaptured) {
        setTimeout(() => setShowLeadDialog(true), 1500);
      }

    } catch (error: any) {
      console.error('❌ Error processing file:', error);
      // Handle error appropriately
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateSummary = (trades: TradeData[]) => {
    const totalTrades = trades.length;
    const winningTrades = trades.filter(t => t.profit > 0).length;
    const losingTrades = trades.filter(t => t.profit < 0).length;
    const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
    const totalVolume = trades.reduce((sum, t) => sum + t.volume, 0);
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      totalProfit,
      totalVolume,
      winRate,
      averageProfit: totalTrades > 0 ? totalProfit / totalTrades : 0,
      profitFactor: calculateProfitFactor(trades)
    };
  };

  const calculateProfitFactor = (trades: TradeData[]): number => {
    const grossProfit = trades.filter(t => t.profit > 0).reduce((sum, t) => sum + t.profit, 0);
    const grossLoss = Math.abs(trades.filter(t => t.profit < 0).reduce((sum, t) => sum + t.profit, 0));
    return grossLoss > 0 ? grossProfit / grossLoss : 0;
  };

  const handleLeadCapture = () => {
    setLeadCaptured(true);
    setShowLeadDialog(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Strategy Report Genie
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your MT5 trading reports into professional insights. Upload your HTML or CSV report and get detailed analytics in seconds.
          </p>
        </div>

        {!reportData ? (
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-dashed border-blue-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-12 pb-12">
                <div {...getRootProps()} className="cursor-pointer">
                  <input {...getInputProps()} />
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {isDragActive ? 'Drop your file here' : 'Upload Your MT5 Report'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Drag and drop your HTML or CSV file here, or click to browse
                    </p>
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Choose File
                    </Button>
                    <p className="text-sm text-gray-500 mt-4">
                      Supports MT5 HTML reports and CSV files
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle>Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Get detailed insights into your trading performance, win rates, and profit factors.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>Visual Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Beautiful charts and graphs that make your data easy to understand and share.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle>Risk Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Comprehensive risk metrics including drawdown analysis and position sizing.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <ModernReportDashboard reportData={reportData} />
        )}

        <LeadCaptureDialog 
          isOpen={showLeadDialog}
          onClose={() => {
            setShowLeadDialog(false);
            handleLeadCapture();
          }}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default StrategyReportGenie;
