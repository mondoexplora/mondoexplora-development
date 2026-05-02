'use client';

import { Hotel } from '@/types';
import { useState } from 'react';
import { trackingManager } from '@/lib/trackingManager';
import { appendOutboundTrackingUrl } from '@/lib/trackingBackend';

interface HotelCardProps {
  hotel: Hotel;
  onViewDeal: (hotel: Hotel) => void;
  lang?: string;
}

export default function HotelCard({ hotel, onViewDeal, lang = 'en' }: HotelCardProps) {
  const [imageError, setImageError] = useState(false);

  const openAffiliate = async () => {
    trackingManager.trackHotelView(hotel.title, hotel.price, hotel.location_heading);
    const url = await appendOutboundTrackingUrl(hotel.link, {
      placement: 'hotel_card',
      partner: 'luxuryescapes',
    });
    window.open(url, '_blank');
    trackingManager.trackHotelBooking(hotel.title, hotel.price, hotel.location_heading);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    void openAffiliate();
  };

  const handleViewDeal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Evitar que se active el click de la tarjeta
    void openAffiliate();
  };

  const getCTAText = () => {
    switch (lang) {
      case 'de':
        return 'Angebot ansehen →';
      case 'fr':
        return 'Voir l\'offre →';
      case 'es':
        return 'Ver oferta →';
      case 'it':
        return 'Vedi offerta →';
      case 'pt':
        return 'Ver oferta →';
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
        {hotel.description && <p>{hotel.description}</p>}
        
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