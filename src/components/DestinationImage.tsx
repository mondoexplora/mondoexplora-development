'use client';

import { useState } from 'react';

interface DestinationImageProps {
  src: string;
  alt: string;
  className: string;
}

export default function DestinationImage({ src, alt, className }: DestinationImageProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className="destination-placeholder">
        <span className="destination-icon">🏙️</span>
      </div>
    );
  }

  return (
    <img 
      src={src}
      alt={alt}
      className={className}
      onError={() => setImageError(true)}
    />
  );
} 