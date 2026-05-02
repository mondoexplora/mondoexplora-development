'use client';

import { useState, useEffect } from 'react';
import { emitConsentChanged } from '@/lib/trackingBackend';

interface PrivacyConsentBoxProps {
  lang?: string;
}

export default function PrivacyConsentBox({ lang = 'en' }: PrivacyConsentBoxProps) {
  const [consent, setConsent] = useState<{
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    personalization: boolean;
  }>({
    necessary: true, // Always true as required for site functionality
    analytics: false,
    marketing: false,
    personalization: false,
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load existing consent from localStorage
    const savedConsent = localStorage.getItem('cookie-consent');
    if (savedConsent === 'accepted') {
      setConsent({
        necessary: true,
        analytics: true,
        marketing: true,
        personalization: true,
      });
    }
    setIsLoaded(true);
  }, []);

  const handleConsentChange = (type: keyof typeof consent) => {
    setConsent(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleSaveConsent = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('consent-preferences', JSON.stringify(consent));
    
    // Apply consent to tracking manager
    if (typeof window !== 'undefined' && (window as any).trackingManager) {
      (window as any).trackingManager.setConsent(consent);
    }
    emitConsentChanged();
    alert(getTexts().successMessage);
  };

  const handleRejectAll = () => {
    setConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
    });
    localStorage.setItem('cookie-consent', 'declined');
    localStorage.setItem('consent-preferences', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
    }));
    
    // Apply consent to tracking manager
    if (typeof window !== 'undefined' && (window as any).trackingManager) {
      (window as any).trackingManager.setConsent({
        necessary: true,
        analytics: false,
        marketing: false,
        personalization: false,
      });
    }
    emitConsentChanged();
    alert(getTexts().rejectMessage);
  };

  const getTexts = () => {
    switch (lang) {
      case 'es':
        return {
          title: 'Gestión de Consentimiento',
          necessary: 'Cookies Necesarias',
          necessaryDesc: 'Requiere para el funcionamiento básico del sitio web.',
          analytics: 'Cookies de Análisis',
          analyticsDesc: 'Nos ayudan a entender cómo usas nuestro sitio web.',
          marketing: 'Cookies de Marketing',
          marketingDesc: 'Usadas para mostrar anuncios relevantes.',
          personalization: 'Personalización',
          personalizationDesc: 'Para personalizar tu experiencia.',
          saveButton: 'Guardar Preferencias',
          rejectButton: 'Rechazar Todo',
          successMessage: 'Preferencias guardadas correctamente.',
          rejectMessage: 'Se han rechazado todas las cookies opcionales.',
        };
      case 'fr':
        return {
          title: 'Gestion du Consentement',
          necessary: 'Cookies Nécessaires',
          necessaryDesc: 'Nécessaires pour le fonctionnement de base du site.',
          analytics: 'Cookies d\'Analyse',
          analyticsDesc: 'Nous aident à comprendre comment vous utilisez notre site.',
          marketing: 'Cookies Marketing',
          marketingDesc: 'Utilisées pour afficher des publicités pertinentes.',
          personalization: 'Personnalisation',
          personalizationDesc: 'Pour personnaliser votre expérience.',
          saveButton: 'Sauvegarder les Préférences',
          rejectButton: 'Tout Rejeter',
          successMessage: 'Préférences sauvegardées avec succès.',
          rejectMessage: 'Tous les cookies optionnels ont été rejetés.',
        };
      case 'it':
        return {
          title: 'Gestione del Consenso',
          necessary: 'Cookie Necessari',
          necessaryDesc: 'Necessari per il funzionamento di base del sito.',
          analytics: 'Cookie di Analisi',
          analyticsDesc: 'Ci aiutano a capire come usi il nostro sito.',
          marketing: 'Cookie Marketing',
          marketingDesc: 'Utilizzati per mostrare annunci pertinenti.',
          personalization: 'Personalizzazione',
          personalizationDesc: 'Per personalizzare la tua esperienza.',
          saveButton: 'Salva Preferenze',
          rejectButton: 'Rifiuta Tutto',
          successMessage: 'Preferenze salvate con successo.',
          rejectMessage: 'Tutti i cookie opzionali sono stati rifiutati.',
        };
      default:
        return {
          title: 'Consent Management',
          necessary: 'Necessary Cookies',
          necessaryDesc: 'Required for basic website functionality.',
          analytics: 'Analytics Cookies',
          analyticsDesc: 'Help us understand how you use our website.',
          marketing: 'Marketing Cookies',
          marketingDesc: 'Used to show relevant advertisements.',
          personalization: 'Personalization',
          personalizationDesc: 'To personalize your experience.',
          saveButton: 'Save Preferences',
          rejectButton: 'Reject All',
          successMessage: 'Preferences saved successfully.',
          rejectMessage: 'All optional cookies have been rejected.',
        };
    }
  };

  const texts = getTexts();

  if (!isLoaded) {
    return <div className="text-gray-600">Loading consent preferences...</div>;
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">{texts.title}</h4>
      
      <div className="space-y-4">
        {/* Necessary Cookies - Always enabled */}
        <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-900">
              {texts.necessary}
            </label>
            <p className="text-xs text-gray-600 mt-1">{texts.necessaryDesc}</p>
          </div>
          <input
            type="checkbox"
            checked={consent.necessary}
            disabled
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
        </div>

        {/* Analytics Cookies */}
        <div className="flex items-start justify-between p-3 bg-white border rounded-lg">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-900">
              {texts.analytics}
            </label>
            <p className="text-xs text-gray-600 mt-1">{texts.analyticsDesc}</p>
          </div>
          <input
            type="checkbox"
            checked={consent.analytics}
            onChange={() => handleConsentChange('analytics')}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        {/* Marketing Cookies */}
        <div className="flex items-start justify-between p-3 bg-white border rounded-lg">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-900">
              {texts.marketing}
            </label>
            <p className="text-xs text-gray-600 mt-1">{texts.marketingDesc}</p>
          </div>
          <input
            type="checkbox"
            checked={consent.marketing}
            onChange={() => handleConsentChange('marketing')}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        {/* Personalization */}
        <div className="flex items-start justify-between p-3 bg-white border rounded-lg">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-900">
              {texts.personalization}
            </label>
            <p className="text-xs text-gray-600 mt-1">{texts.personalizationDesc}</p>
          </div>
          <input
            type="checkbox"
            checked={consent.personalization}
            onChange={() => handleConsentChange('personalization')}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSaveConsent}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {texts.saveButton}
        </button>
        <button
          onClick={handleRejectAll}
          className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
        >
          {texts.rejectButton}
        </button>
      </div>
    </div>
  );
}