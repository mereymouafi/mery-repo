import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface BorderStarProps {
  containerRef: React.RefObject<HTMLDivElement>;
  direction?: 'clockwise' | 'counterclockwise';
  color?: string;
}

const BorderStar: React.FC<BorderStarProps> = ({ containerRef, direction = 'clockwise', color = '#FFFFFF' }) => {
  const starRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [progress, setProgress] = React.useState(0);
  
  // Update star position along the border
  useEffect(() => {
    if (!containerRef.current || !starRef.current) return;
    
    // Animation frame for smooth movement
    let animationId: number;
    let lastTime = 0;
    
    const animateStar = (time: number) => {
      if (!lastTime) lastTime = time;
      const deltaTime = time - lastTime;
      lastTime = time;
      
      // Speed control - complete one circuit in about 10 seconds
      const increment = deltaTime / 10000;
      
      // Handle direction (clockwise or counterclockwise)
      if (direction === 'clockwise') {
        setProgress(prev => (prev + increment) % 1);
      } else {
        setProgress(prev => (prev - increment + 1) % 1);
      }
      
      animationId = requestAnimationFrame(animateStar);
    };
    
    animationId = requestAnimationFrame(animateStar);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [containerRef]);
  
  // Calculate position based on progress (0-1)
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Container dimensions
    const width = rect.width;
    const height = rect.height;
    
    // Total perimeter length
    const perimeter = 2 * (width + height);
    const distanceAlongPerimeter = progress * perimeter;
    
    let x = 0;
    let y = 0;
    
    // Top edge
    if (distanceAlongPerimeter < width) {
      x = distanceAlongPerimeter;
      y = 0;
    } 
    // Right edge
    else if (distanceAlongPerimeter < width + height) {
      x = width;
      y = distanceAlongPerimeter - width;
    } 
    // Bottom edge
    else if (distanceAlongPerimeter < 2 * width + height) {
      x = width - (distanceAlongPerimeter - width - height);
      y = height;
    } 
    // Left edge
    else {
      x = 0;
      y = height - (distanceAlongPerimeter - 2 * width - height);
    }
    
    setPosition({ x, y });
  }, [progress, containerRef]);
  
  return (
    <motion.div
      ref={starRef}
      className="absolute w-2 h-2 z-10"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none'
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Sharp star with crisp edges */}
      <div className="w-full h-full rounded-full" style={{ backgroundColor: color, boxShadow: '0 0 2px 2px rgba(255, 255, 255, 0.5)' }} />
    </motion.div>
  );
};

export default BorderStar;
