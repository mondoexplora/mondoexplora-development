'use client';

import { Hotel } from '@/types';
import { useState } from 'react';

interface HotelCardProps {
  hotel: Hotel;
  onViewDeal: (hotel: Hotel) => void;
  lang?: string;
}

export default function HotelCard({ hotel, onViewDeal, lang = 'en' }: HotelCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Abrir enlace de afiliado en nueva pestaña
    window.open(hotel.link, '_blank');
    
    // TODO: Add tracking events here
    // gtag('event', 'click', { 'event_category': 'hotel_card', 'event_label': hotel.title });
  };

  const handleViewDeal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Evitar que se active el click de la tarjeta
    // Abrir enlace de afiliado en nueva pestaña
    window.open(hotel.link, '_blank');
    
    // TODO: Add tracking events here
    // gtag('event', 'click', { 'event_category': 'hotel_deal', 'event_label': hotel.title });
  };

  const getCTAText = () => {
    switch (lang) {
      case 'es':
        return 'Ver oferta →';
      case 'fr':
        return 'Voir l\'offre →';
      case 'it':
        return 'Vedi offerta →';
      default:
        return 'View Deal →';
    }
  };

  return (
    <div className="hotel-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="hotel-image-container">
        <img
          src={imageError ? '/images/placeholder-hotel.jpg' : hotel.hero_image}
          alt={hotel.title}
          className="hotel-image"
          onError={() => setImageError(true)}
        />
        
        <div className="hotel-price">
          {hotel.original_price && hotel.original_price > hotel.price && (
            <del>${hotel.original_price}</del>
          )}
          ${hotel.price}
        </div>
      </div>
      
      <div className="hotel-card-content">
        <h4>{hotel.title}</h4>
        <div className="hotel-location">
          {hotel.location_heading}, {hotel.location_subheading}
        </div>
        <p>{hotel.description}</p>
        
        <a 
          href="#" 
          className="view-deal-btn"
          onClick={handleViewDeal}
        >
          {getCTAText()}
        </a>
      </div>
    </div>
  );
} 