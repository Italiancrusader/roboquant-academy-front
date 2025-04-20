
import React, { useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    quote: "I was spending $4,000+ per strategy on freelance developers. After RoboQuant Academy, I've built 6 bots myself with better performance than what I was paying for.",
    name: "Michael T.",
    title: "Forex Trader, 3 years experience",
    rating: 5,
    result: "+28% ROI in first 3 months"
  },
  {
    quote: "The no-code approach finally made algorithmic trading accessible to me. My first bot is up and running with a +12% return, and I've never written a line of code.",
    name: "Sarah K.",
    title: "Part-time Trader",
    rating: 5,
    result: "First bot built in 5 days"
  },
  {
    quote: "I'm now selling my own custom EAs to my trading community. This course paid for itself 10x over in the first month alone.",
    name: "James L.",
    title: "Trading Education Creator",
    rating: 5,
    result: "$5,800 in EA sales first month"
  },
  {
    quote: "The back-testing module alone was worth the investment. I discovered flaws in my strategy that would have cost me thousands if I'd gone live without fixing them.",
    name: "Rebecca M.",
    title: "Former Discretionary Trader",
    rating: 4,
    result: "Avoided $12k potential loss"
  }
];

const Testimonials: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const maxSlides = testimonials.length;
  const { ref, isVisible } = useIntersectionObserver();
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % maxSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section 
      id="testimonials" 
      className="section-padding bg-background"
      ref={ref as React.RefObject<HTMLElement>}
    >
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            <span className="gradient-text">Success Stories</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Hear from traders who have transformed their approach with RoboQuant Academy.
          </p>
        </div>
        
        <div className={`relative ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="w-full flex-shrink-0 px-4"
              >
                <Card className="bg-gradient-to-br from-card/80 to-secondary/50 backdrop-blur-sm border border-white/5 max-w-3xl mx-auto p-6 md:p-8">
                  <CardContent className="p-0">
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                        />
                      ))}
                    </div>
                    <p className="text-xl md:text-2xl mb-8 leading-relaxed text-white italic">{testimonial.quote}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-primary to-teal-primary rounded-full flex items-center justify-center mr-4 shadow-glow">
                          <span className="font-bold text-lg text-white">{testimonial.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{testimonial.name}</h4>
                          <p className="text-gray-400 text-sm">{testimonial.title}</p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-blue-primary/20 to-teal-primary/20 py-2 px-4 rounded-full self-start sm:self-auto">
                        <p className="text-teal-primary font-medium text-sm">{testimonial.result}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
          
          {/* Navigation arrows */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-2 md:left-4 -translate-y-1/2 transform p-2 rounded-full bg-gradient-to-br from-card to-secondary/70 border border-white/5 text-gray-300 hover:text-teal-primary transition-all z-20 shadow-lg shadow-black/20"
            aria-label="Previous testimonial"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-2 md:right-4 -translate-y-1/2 transform p-2 rounded-full bg-gradient-to-br from-card to-secondary/70 border border-white/5 text-gray-300 hover:text-teal-primary transition-all z-20 shadow-lg shadow-black/20"
            aria-label="Next testimonial"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          
          {/* Dots navigation */}
          <div className="flex justify-center mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 mx-1 rounded-full transition-all ${
                  currentSlide === index 
                    ? 'bg-gradient-to-r from-blue-primary to-teal-primary scale-125 shadow-glow' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <a href="#pricing">
            <Button className="cta-button text-white py-5 px-8">
              See Pricing & Enroll <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
