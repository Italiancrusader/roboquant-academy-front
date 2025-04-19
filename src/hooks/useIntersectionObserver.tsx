
import { useEffect, useRef, useState } from 'react';

type IntersectionObserverOptions = {
  threshold?: number;
  rootMargin?: string;
};

export const useIntersectionObserver = ({
  threshold = 0.1,
  rootMargin = '0px',
}: IntersectionObserverOptions = {}) => {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold, rootMargin }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isVisible, rootMargin, threshold]);

  return { ref, isVisible };
};
