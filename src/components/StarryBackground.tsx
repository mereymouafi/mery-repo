import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  vx: number;
  vy: number;
  connections: number[];
}

interface Particle {
  x: number;
  y: number;
  progress: number;
  speed: number;
  startIndex: number;
  endIndex: number;
}

const NetworkBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const animationFrameRef = useRef<number>(0);

  // Colors for an elegant, premium dark theme
  const colors = {
    background: 'rgb(16, 18, 27)', // Rich dark background with slight blue undertone
    nodeFill: [
      'rgba(145, 188, 242, 0.9)', // Soft steel blue
      'rgba(116, 140, 171, 0.9)', // Muted slate
      'rgba(86, 130, 163, 0.9)',  // Deep cerulean
      'rgba(182, 210, 237, 0.9)'  // Pale sky blue
    ],
    connectionLine: 'rgba(86, 110, 145, 0.12)', // Subtle, sophisticated connections
    particle: 'rgba(209, 231, 255, 0.85)', // Elegant bright particles
    mouseArea: 'rgba(180, 210, 240, 0.04)' // Very subtle interaction highlight
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full screen and handle pixel ratio for crisp rendering
    const resizeCanvas = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * pixelRatio;
      canvas.height = window.innerHeight * pixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(pixelRatio, pixelRatio);
      
      // Generate nodes only on initial resize or when nodes don't exist
      if (nodesRef.current.length === 0) {
        generateNodes();
        generateParticles();
      }
    };

    // Generate network nodes
    const generateNodes = () => {
      const density = window.innerWidth <= 768 ? 15000 : 12000; // Lower density on mobile
      const nodeCount = Math.max(15, Math.floor((window.innerWidth * window.innerHeight) / density));
      const nodes: Node[] = [];
      
      for (let i = 0; i < nodeCount; i++) {
        const radius = Math.random() * 2 + 1.5;
        nodes.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          radius,
          color: colors.nodeFill[Math.floor(Math.random() * colors.nodeFill.length)],
          alpha: 0.3 + Math.random() * 0.5,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          connections: []
        });
      }
      
      // Create connections between nodes
      const connectionDistance = Math.min(window.innerWidth, window.innerHeight) / 4;
      
      nodes.forEach((node, index) => {
        // Find nodes within connection distance
        for (let i = 0; i < nodes.length; i++) {
          if (i !== index) {
            const dx = node.x - nodes[i].x;
            const dy = node.y - nodes[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < connectionDistance) {
              // Only connect if it's not already connected and limit connections
              if (!node.connections.includes(i) && node.connections.length < 3) {
                node.connections.push(i);
              }
            }
          }
        }
      });
      
      nodesRef.current = nodes;
    };

    // Generate particles that will travel along connections
    const generateParticles = () => {
      const particles: Particle[] = [];
      const particleCount = Math.min(50, Math.floor(window.innerWidth / 40));
      
      // Create initial particles
      for (let i = 0; i < particleCount; i++) {
        const startNodeIndex = Math.floor(Math.random() * nodesRef.current.length);
        const startNode = nodesRef.current[startNodeIndex];
        
        if (startNode.connections.length > 0) {
          const endNodeIndex = startNode.connections[Math.floor(Math.random() * startNode.connections.length)];
          
          particles.push({
            x: startNode.x,
            y: startNode.y,
            progress: 0,
            speed: 0.2 + Math.random() * 0.5,
            startIndex: startNodeIndex,
            endIndex: endNodeIndex
          });
        }
      }
      
      particlesRef.current = particles;
    };

    // Draw the network visualization
    const drawNetwork = () => {
      // Clear and fill background
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.fillStyle = colors.background;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      
      const mouseActive = mouseRef.current.active;
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      const mouseRadius = 100;
      
      // Draw mouse interaction area if active
      if (mouseActive) {
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          mouseX, mouseY, 0, 
          mouseX, mouseY, mouseRadius
        );
        gradient.addColorStop(0, colors.mouseArea);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.arc(mouseX, mouseY, mouseRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Draw connections between nodes
      ctx.lineWidth = 0.5;
      
      nodesRef.current.forEach((node, index) => {
        node.connections.forEach(connectedIndex => {
          const connectedNode = nodesRef.current[connectedIndex];
          
          // Only draw each connection once
          if (index < connectedIndex) {
            const dx = connectedNode.x - node.x;
            const dy = connectedNode.y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Calculate opacity based on distance
            const maxDistance = Math.min(window.innerWidth, window.innerHeight) / 4;
            const distanceOpacity = 1 - (distance / maxDistance);
            
            // Draw subtle connection line with opacity based on distance
            ctx.beginPath();
            // Use the connection line color with opacity adjusted based on distance
            const baseColor = colors.connectionLine.replace(/[^,]+(?=\))/, `${0.15 * distanceOpacity + 0.1}`);
            ctx.strokeStyle = baseColor;
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(connectedNode.x, connectedNode.y);
            ctx.stroke();
          }
        });
      });
      
      // Update and draw particles
      particlesRef.current.forEach((particle, index) => {
        const startNode = nodesRef.current[particle.startIndex];
        const endNode = nodesRef.current[particle.endIndex];
        
        // Update particle position along the connection
        particle.progress += particle.speed / 100;
        
        if (particle.progress >= 1) {
          // Reached destination, start a new journey
          particle.progress = 0;
          particle.startIndex = particle.endIndex;
          
          const newStartNode = nodesRef.current[particle.startIndex];
          if (newStartNode.connections.length > 0) {
            particle.endIndex = newStartNode.connections[
              Math.floor(Math.random() * newStartNode.connections.length)
            ];
          } else {
            // No connections, pick a random node
            particle.endIndex = Math.floor(Math.random() * nodesRef.current.length);
          }
        }
        
        // Calculate current position
        const dx = endNode.x - startNode.x;
        const dy = endNode.y - startNode.y;
        particle.x = startNode.x + dx * particle.progress;
        particle.y = startNode.y + dy * particle.progress;
        
        // Draw particle with elegant pulsing effect and subtle glow
        const time = Date.now() / 1000;
        const pulseSize = 1.8 * Math.sin(time * Math.PI + index * 0.3) + 2.5;
        
        // Add subtle glow effect
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, pulseSize * 1.5
        );
        gradient.addColorStop(0, colors.particle);
        gradient.addColorStop(1, 'rgba(209, 231, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, pulseSize * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw brighter center
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, pulseSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
      });
      
      // Draw nodes with elegant gradients
      nodesRef.current.forEach(node => {
        // Create a subtle radial gradient for each node
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.radius * 1.5
        );
        
        // Parse the rgba color to get components
        const colorBase = node.color.match(/rgba?\(([\d., ]+)\)/);
        let r, g, b, a;
        
        if (colorBase && colorBase[1]) {
          const parts = colorBase[1].split(',').map(p => parseFloat(p.trim()));
          [r, g, b, a = node.alpha] = parts;
          
          // Create a brighter center and softer edge
          gradient.addColorStop(0, `rgba(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)}, ${a})`);
          gradient.addColorStop(0.6, node.color);
          gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
          
          // Draw the main node
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
          
          // Add a small, brighter core
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${Math.min(255, r + 80)}, ${Math.min(255, g + 80)}, ${Math.min(255, b + 80)}, ${a})`;  
          ctx.fill();
        } else {
          // Fallback if color parsing fails
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          ctx.fill();
        }
        
        // Update node position
        node.x += node.vx;
        node.y += node.vy;
        
        // Mouse interaction
        if (mouseActive) {
          const dx = mouseX - node.x;
          const dy = mouseY - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouseRadius) {
            // Gently push nodes away from mouse
            const force = (1 - distance / mouseRadius) * 0.2;
            node.vx -= dx * force / distance;
            node.vy -= dy * force / distance;
          }
        }
        
        // Slightly randomize velocity for organic movement
        node.vx += (Math.random() - 0.5) * 0.01;
        node.vy += (Math.random() - 0.5) * 0.01;
        
        // Apply damping to prevent excessive speed
        node.vx *= 0.99;
        node.vy *= 0.99;
        
        // Bounce off edges
        if (node.x < 0 || node.x > window.innerWidth) {
          node.vx *= -1;
          node.x = Math.max(0, Math.min(node.x, window.innerWidth));
        }
        
        if (node.y < 0 || node.y > window.innerHeight) {
          node.vy *= -1;
          node.y = Math.max(0, Math.min(node.y, window.innerHeight));
        }
      });
      
      animationFrameRef.current = requestAnimationFrame(drawNetwork);
    };

    // Mouse interaction handlers
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };
    
    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    // Touch interaction for mobile
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
        mouseRef.current.active = true;
      }
    };
    
    const handleTouchEnd = () => {
      mouseRef.current.active = false;
    };

    // Set up event listeners
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
    
    // Initialize
    resizeCanvas();
    drawNetwork();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ pointerEvents: 'auto' }}
    />
  );
};

export default NetworkBackground;
