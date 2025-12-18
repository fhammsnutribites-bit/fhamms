import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component - Automatically scrolls to top when route changes
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // Force scroll to top using multiple methods
    const scrollToTop = () => {
      // Method 1: window.scrollTo
      window.scrollTo(0, 0);

      // Method 2: Direct DOM manipulation
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;

      // Method 3: Using scrollIntoView on body
      document.body.scrollIntoView({ block: 'start', behavior: 'instant' });
    };

    // Immediate scroll
    scrollToTop();

    // Additional scrolls with different timing to ensure it works
    requestAnimationFrame(scrollToTop);

    setTimeout(scrollToTop, 10);
    setTimeout(scrollToTop, 50);
    setTimeout(scrollToTop, 100);
    setTimeout(scrollToTop, 200);

  }, [pathname]);

  return null; // This component doesn't render anything
}

export default ScrollToTop;

