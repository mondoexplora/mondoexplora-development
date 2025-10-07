"use client";

import { useState } from 'react';
import { trackingManager } from '@/lib/trackingManager';

export default function ConsentBox({ lang, redirectUrl }: { lang: string; redirectUrl: string }) {
  const [checked, setChecked] = useState(false);

  const labels: Record<string, { text: string; btn: string; box: string }> = {
    en: { text: 'I agree to the Privacy Policy and the use of cookies for analytics and marketing.', btn: 'Accept and Continue', box: 'I agree' },
    es: { text: 'Acepto la Política de Privacidad y el uso de cookies para analítica y marketing.', btn: 'Aceptar y Continuar', box: 'Acepto' },
    fr: { text: "J'accepte la Politique de Confidentialité et l'utilisation de cookies pour l'analyse et le marketing.", btn: 'Accepter et Continuer', box: "J'accepte" },
    it: { text: 
"Accetto l'Informativa sulla Privacy e l'uso dei cookie per analisi e marketing.", btn: 'Accetta e Continua', box: 'Accetto' },
  };

  const t = labels[lang] || labels.en;

  const onAccept = () => {
    trackingManager.setConsent({ necessary: true, analytics: true, marketing: true, personalization: true });
    window.location.href = redirectUrl;
  };

  return (
    <div style={{ marginTop: 24, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
      <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
        <span>{t.text}</span>
      </label>
      <button
        onClick={onAccept}
        disabled={!checked}
        style={{ marginTop: 12, padding: '10px 14px', borderRadius: 6, border: 0, background: checked ? '#10b981' : '#9ca3af', color: '#0b1f16', fontWeight: 600, cursor: checked ? 'pointer' : 'not-allowed' }}
      >
        {t.btn}
      </button>
    </div>
  );
}
