import { useEffect, useState } from 'react';
import { debounce } from '../utils/debounce';

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState<{
    width: number | undefined;
    height: number | undefined;
  }>({
    height: undefined,
    width: undefined,
  });

  useEffect(() => {
    let isUnmounted = false;
    const handleResize = debounce(() => {
      if (isUnmounted) {
        return;
      }
      setWindowSize({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    }, 500); // 500ms debounce by default
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      isUnmounted = true;
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return windowSize;
};
