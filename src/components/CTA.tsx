
import React, { useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { handleStripeCheckout } from '@/services/stripe';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

const CTA: React.FC = () => {
  const { ref, isVisible } = useIntersectionObserver();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  
  const handleEnroll = async () => {
    if (!user) {
      navigate('/auth', { state: { from: '/' } });
      return;
    }
    
    await handleStripeCheckout({
      courseId: 'premium', // Replace with your actual premium course ID
      courseTitle: 'RoboQuant Academy',
      price: 1500, // $1,500 (updated from $2,000)
      userId: user.id,
      couponCode: couponCode.trim() || undefined
    });
  };
  
  return (
    <section 
      className="section-padding relative bg-gradient-to-r from-blue-primary to-teal-primary overflow-hidden"
      ref={ref as React.RefObject<HTMLElement>}
    >
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-black/10 opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full border-8 border-white/10"></div>
        <div className="absolute top-20 left-20 w-40 h-40 rounded-full border-4 border-white/10"></div>
      </div>
      
      <div className="container mx-auto relative">
        <div className={`max-w-3xl mx-auto text-center ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to build profitable trading bots without writing code?
          </h2>
          
          <p className="text-xl text-white/90 mb-8">
            Join thousands of traders who have transformed their trading with RoboQuant Academy.
          </p>
          
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="max-w-xs w-full">
              <Input
                type="text"
                placeholder="Enter coupon code (optional)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="bg-white/90 border-none text-blue-primary placeholder:text-gray-400"
              />
            </div>
            
            <Button 
              className="bg-white text-blue-primary hover:bg-gray-100 py-6 px-10 text-lg font-semibold"
              onClick={handleEnroll}
            >
              Enroll Now – $1,500 <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <p className="mt-6 text-white/80 text-sm">
            One-time payment • Lifetime access • 30-day money-back guarantee
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
