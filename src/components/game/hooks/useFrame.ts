import { useEffect, useRef } from 'react';

export const useFrame = (callback: (timestamp: number) => void, isActive: boolean) => {
  const frameRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  useEffect(() => {
    if (!isActive) return;

    const animate = (timestamp: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = timestamp - previousTimeRef.current;
        callback(deltaTime);
      }
      previousTimeRef.current = timestamp;
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [callback, isActive]);
};