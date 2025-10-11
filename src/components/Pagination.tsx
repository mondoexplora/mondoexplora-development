'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalHotels: number;
  hotelsPerPage: number;
  onPageChange: (page: number) => void;
  lang?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalHotels,
  hotelsPerPage,
  onPageChange,
  lang = 'en'
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const startHotel = (currentPage - 1) * hotelsPerPage + 1;
  const endHotel = Math.min(currentPage * hotelsPerPage, totalHotels);

  const getTexts = () => {
    switch (lang) {
      case 'es':
        return {
          showing: 'Mostrando',
          of: 'de',
          hotels: 'hoteles',
          previous: 'Anterior',
          next: 'Siguiente'
        };
      case 'fr':
        return {
          showing: 'Affichage de',
          of: 'sur',
          hotels: 'hôtels',
          previous: 'Précédent',
          next: 'Suivant'
        };
      case 'it':
        return {
          showing: 'Mostrando',
          of: 'di',
          hotels: 'hotel',
          previous: 'Precedente',
          next: 'Successivo'
        };
      default: // 'en'
        return {
          showing: 'Showing',
          of: 'of',
          hotels: 'hotels',
          previous: 'Previous',
          next: 'Next'
        };
    }
  };

  const texts = getTexts();

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 border-t border-gray-200">
      <div className="text-sm text-gray-600">
        {texts.showing} {startHotel}-{endHotel} {texts.of} {totalHotels} {texts.hotels}
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {texts.previous}
        </button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {texts.next}
        </button>
      </div>
    </div>
  );
} 