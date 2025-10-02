import { useEffect } from 'react';

export const useModalScrollLock = (isOpen) => {
  useEffect(() => {
    if (isOpen) {
      // Store original overflow value
      const originalOverflow = document.body.style.overflow;
      
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      
      // Cleanup function
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);
};