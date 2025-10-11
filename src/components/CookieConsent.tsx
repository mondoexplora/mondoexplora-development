'use client';

import { useState, useEffect } from 'react';

interface CookieConsentProps {
  onAccept: () => void;
  onDecline: () => void;
  lang?: string;
}

export default function CookieConsent({ onAccept, onDecline, lang = 'en' }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
      
      // Set up implicit consent tracking
      const handleUserInteraction = () => {
        if (!hasInteracted) {
          setHasInteracted(true);
          // Auto-accept consent after user interaction
          localStorage.setItem('cookie-consent', 'accepted');
          setIsVisible(false);
          onAccept();
        }
      };

      // Track various user interactions as implicit consent
      const events = ['click', 'scroll', 'keydown', 'touchstart'];
      events.forEach(event => {
        document.addEventListener(event, handleUserInteraction, { once: true });
      });

      // Cleanup event listeners
      return () => {
        events.forEach(event => {
          document.removeEventListener(event, handleUserInteraction);
        });
      };
    }
  }, [onAccept, hasInteracted]);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
    onAccept();
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
    onDecline();
  };

  const getTexts = () => {
    switch (lang) {
      case 'es':
        return {
          title: 'Política de Cookies',
          message: 'Utilizamos cookies para mejorar su experiencia, analizar el tráfico del sitio y personalizar el contenido. Al interactuar con nuestro sitio, acepta nuestro uso de cookies.',
          accept: 'Aceptar Todas',
          decline: 'Solo Necesarias',
          privacy: 'Política de Privacidad'
        };
      case 'fr':
        return {
          title: 'Politique des Cookies',
          message: 'Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic du site et personnaliser le contenu. En interagissant avec notre site, vous acceptez notre utilisation des cookies.',
          accept: 'Accepter Tout',
          decline: 'Nécessaires Seulement',
          privacy: 'Politique de Confidentialité'
        };
      case 'it':
        return {
          title: 'Politica dei Cookie',
          message: 'Utilizziamo i cookie per migliorare la tua esperienza, analizzare il traffico del sito e personalizzare i contenuti. Interagendo con il nostro sito, accetti il nostro utilizzo dei cookie.',
          accept: 'Accetta Tutto',
          decline: 'Solo Necessari',
          privacy: 'Politica sulla Privacy'
        };
      default:
        return {
          title: 'Cookie Policy',
          message: 'We use cookies to enhance your experience, analyze site traffic, and personalize content. By interacting with our site, you consent to our use of cookies.',
          accept: 'Accept All',
          decline: 'Necessary Only',
          privacy: 'Privacy Policy'
        };
    }
  };

  const texts = getTexts();

  if (!isVisible) return null;

  return (
    <div className="cookie-consent-overlay">
      <div className="cookie-consent-banner">
        <div className="cookie-consent-content">
          <h3>{texts.title}</h3>
          <p>{texts.message}</p>
          <div className="cookie-consent-actions">
            <a href={`/${lang}/privacy`} className="privacy-link">
              {texts.privacy}
            </a>
            <div className="consent-buttons">
              <button onClick={handleDecline} className="decline-btn">
                {texts.decline}
              </button>
              <button onClick={handleAccept} className="accept-btn">
                {texts.accept}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
