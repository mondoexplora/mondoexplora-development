'use client';

import { useState } from 'react';
import { Hotel } from '@/types';
import HotelCard from './HotelCard';
import Pagination from './Pagination';

interface HotelGridProps {
  hotels: Hotel[];
  hotelsPerPage?: number;
  lang?: string;
}

export default function HotelGrid({ hotels, hotelsPerPage = 6, lang = 'en' }: HotelGridProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const handleViewDeal = (hotel: Hotel) => {
    // Este método ya no se usa, pero lo mantenemos por compatibilidad
    // El comportamiento ahora se maneja directamente en HotelCard
  };

  if (!hotels || hotels.length === 0) {
    const noHotelsText = {
      en: 'No hotels found.',
      de: 'Keine Hotels gefunden.',
      fr: 'Aucun hôtel trouvé.',
      es: 'No se encontraron hoteles disponibles.',
      it: 'Nessun hotel trovato.',
      pt: 'Nenhum hotel encontrado.'
    };
    
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{noHotelsText[lang as keyof typeof noHotelsText] || noHotelsText.en}</p>
      </div>
    );
  }

  const totalPages = Math.ceil(hotels.length / hotelsPerPage);
  const startIndex = (currentPage - 1) * hotelsPerPage;
  const endIndex = startIndex + hotelsPerPage;
  const currentHotels = hotels.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of hotel grid
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <div className="hotel-grid">
        {currentHotels.map((hotel, index) => (
          <HotelCard
            key={`${hotel.vendor_name}-${startIndex + index}`}
            hotel={hotel}
            onViewDeal={handleViewDeal}
            lang={lang}
          />
        ))}
      </div>
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalHotels={hotels.length}
        hotelsPerPage={hotelsPerPage}
        onPageChange={handlePageChange}
        lang={lang}
      />
    </div>
  );
} 