import React from 'react';
import { Crown } from 'lucide-react';

interface LogoProps {
  variant?: 'default' | 'white';
}

const Logo: React.FC<LogoProps> = ({ variant = 'default' }) => {
  const textColor = variant === 'white' ? 'text-white' : 'text-luxury-black';
  const iconColor = variant === 'white' ? '#FFFFFF' : '#121212';
  
  return (
    <div className="flex items-center">
      <Crown size={22} color={iconColor} />
      <div className={`ml-2 font-serif font-bold text-lg ${textColor}`}>
        LUXE MAROC
      </div>
    </div>
  );
};

export default Logo;