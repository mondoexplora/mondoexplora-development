import Image from 'next/image';
import { ReactNode } from 'react';

interface HeroProps {
  title: string;
  subtitle?: string;
  backgroundImage: string;
  location?: string;
  cta?: ReactNode;
}

export default function Hero({ title, subtitle, backgroundImage, location, cta }: HeroProps) {
  return (
    <div className="hero-section" style={{ backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(42, 63, 89, 0.8) 100%), url(${backgroundImage})` }}>
      <div className="page-header">
        {/* Logo en la esquina superior derecha */}
        <div className="logo-overlay">
          <span>Mondo</span>
          <span>Explora</span>
        </div>
        
        <div className="text-white">
          <h1 className="page-header h1">
            {title}
          </h1>
          
          {subtitle && (
            <p className="page-header p">
              {subtitle}
            </p>
          )}
          
          
          {cta && (
            <div className="mt-20">
              {cta}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 