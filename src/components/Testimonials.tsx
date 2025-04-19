
import React, { useState, useRef, useEffect } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const testimonials = [
  {
    quote: "The RoboQuant Academy transformed my trading approach completely. I went from discretionary trading to having fully automated systems that perform consistently.",
    name: "Alex Chen",
    title: "Algorithmic Trader, Former Software Engineer"
  },
  {
    quote: "The curriculum structure makes complex concepts digestible. I especially valued the risk management and portfolio construction modules - they've been game-changing.",
    name: "Sarah Williams",
    title: "Quantitative Analyst"
  },
  {
    quote: "After years of inconsistent results, this program gave me the systematic approach I needed. The community is incredibly supportive and the instructors are world-class.",
    name: "Michael Rodriguez",
    title: "Independent Trader"
  },
  {
    quote: "Worth every penny for the institutional knowledge alone. The insights on execution algorithms helped me reduce slippage by 23% on my existing strategies.",
    name: "Jennifer Taylor",
    title: "Hedge Fund Analyst"
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
      className="section-padding relative bg-gradient-to-b from-charcoal/80 to-charcoal overflow-hidden"
      ref={ref as React.RefObject<HTMLElement>}
    >
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-[-300px] right-[-300px] w-[600px] h-[600px] rounded-full bg-blue-primary/10 blur-[120px]"></div>
        <div className="absolute bottom-[-200px] left-[-200px] w-[400px] h-[400px] rounded-full bg-teal-primary/10 blur-[100px]"></div>
      </div>
      
      <div className="container mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our <span className="gradient-text">Students Say</span>
          </h2>
          <p className="text-xl text-white-primary/80 max-w-2xl mx-auto">
            Success stories from our community of quantitative traders.
          </p>
        </div>
        
        <div className="relative">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="w-full flex-shrink-0 px-4"
              >
                <div className={`glass-card p-8 md:p-10 rounded-2xl max-w-3xl mx-auto ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
                  <div className="mb-6">
                    <svg className="w-10 h-10 text-teal-primary opacity-80" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                  <p className="text-xl md:text-2xl mb-6 leading-relaxed">{testimonial.quote}</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mr-4">
                      <span className="font-bold text-lg">{testimonial.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-bold">{testimonial.name}</h4>
                      <p className="text-white-primary/70 text-sm">{testimonial.title}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Navigation arrows */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-0 -translate-y-1/2 transform p-2 rounded-full bg-charcoal/50 border border-white/10 text-white-primary/80 hover:text-white-primary transition-all z-20"
            aria-label="Previous testimonial"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-0 -translate-y-1/2 transform p-2 rounded-full bg-charcoal/50 border border-white/10 text-white-primary/80 hover:text-white-primary transition-all z-20"
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
                  currentSlide === index ? 'bg-gradient-primary scale-125' : 'bg-white/30'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
