
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Pricing from '@/components/Pricing';

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 pt-24 pb-20">
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4 text-center">Pricing Plans</h1>
        <p className="text-lg text-center max-w-2xl mx-auto mb-12 text-muted-foreground">
          Choose the plan that's right for you
        </p>
        <Pricing />
      </div>
      <Footer />
    </div>
  );
};

export default PricingPage;
