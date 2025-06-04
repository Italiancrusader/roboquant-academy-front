
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { trackViewContent } from '@/utils/metaPixel';
import { trackViewContentConversionsAPI } from '@/utils/metaConversionsApi';

const StrategyReportGenie = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Strategy Report Genie
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            This feature has been temporarily removed.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">
                Feature Unavailable
              </h3>
              <p className="text-gray-600 mb-6">
                The Strategy Report Genie feature is currently unavailable.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default StrategyReportGenie;
