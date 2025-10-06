import LanguageSwitcher from './LanguageSwitcher';

interface FooterProps {
  currentLang?: string;
}

export default function Footer({ currentLang }: FooterProps) {
  return (
    <footer>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-light">Mondo</span>
            <span className="text-lg font-bold bg-white/30 text-blue-900 px-2 py-1 rounded">Explora</span>
          </div>
          
          {/* Language Switcher */}
          {currentLang && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Idioma / Language:</span>
              <LanguageSwitcher currentLang={currentLang} />
            </div>
          )}
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>&copy; 2024 MondoExplora. Todos los derechos reservados. | All rights reserved.</p>
          <p className="mt-1">
            Encuentra las mejores ofertas de hoteles y viajes | Find the best hotel and travel deals
          </p>
        </div>
      </div>
    </footer>
  );
} 