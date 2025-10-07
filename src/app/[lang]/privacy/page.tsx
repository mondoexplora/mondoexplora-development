import { Metadata } from 'next';

interface PrivacyPageProps {
  params: {
    lang: string;
  };
}

export const dynamicParams = false;
export function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'es' }, { lang: 'fr' }, { lang: 'it' }];
}

// Using parent metadata; page content provides localized headings

export default function PrivacyPage({ params }: any) {
  const { lang } = params;
  const acceptUrl = `/${lang}`;

  const getContent = () => {
    switch (lang) {
      case 'es':
        return {
          title: 'Política de Privacidad',
          lastUpdated: 'Última actualización: 7 de octubre de 2024',
          sections: [
            {
              title: '1. Información que Recopilamos',
              content: `Recopilamos información que nos proporciona directamente, como cuando crea una cuenta, hace una reserva o se comunica con nosotros. También recopilamos información automáticamente cuando utiliza nuestro sitio web, incluyendo:
              
              • Información de navegación (páginas visitadas, tiempo en el sitio)
              • Información del dispositivo (tipo de dispositivo, navegador, dirección IP)
              • Cookies y tecnologías similares
              • Datos de ubicación (si los permite)`
            },
            {
              title: '2. Cómo Utilizamos su Información',
              content: `Utilizamos su información para:
              
              • Proporcionar y mejorar nuestros servicios
              • Procesar reservas y transacciones
              • Personalizar su experiencia
              • Enviar comunicaciones de marketing (con su consentimiento)
              • Analizar el uso del sitio web
              • Cumplir con obligaciones legales`
            },
            {
              title: '3. Cookies y Tecnologías de Seguimiento',
              content: `Utilizamos cookies y tecnologías similares para:
              
              • Recordar sus preferencias
              • Analizar el tráfico del sitio web
              • Personalizar contenido y anuncios
              • Medir la efectividad de nuestras campañas
              
              Puede controlar las cookies a través de la configuración de su navegador.`
            },
            {
              title: '4. Compartir Información',
              content: `Podemos compartir su información con:
              
              • Proveedores de servicios de confianza
              • Socios comerciales (con su consentimiento)
              • Autoridades legales (cuando sea requerido por ley)
              
              No vendemos su información personal a terceros.`
            },
            {
              title: '5. Sus Derechos',
              content: `Tiene derecho a:
              
              • Acceder a su información personal
              • Corregir información inexacta
              • Eliminar su información
              • Restringir el procesamiento
              • Portabilidad de datos
              • Oponerse al procesamiento
              
              Para ejercer estos derechos, contáctenos.`
            },
            {
              title: '6. Seguridad de Datos',
              content: `Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción.`
            },
            {
              title: '7. Retención de Datos',
              content: `Conservamos su información personal solo durante el tiempo necesario para cumplir con los propósitos descritos en esta política, a menos que la ley requiera un período de retención más largo.`
            },
            {
              title: '8. Cambios a esta Política',
              content: `Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos sobre cambios significativos publicando la nueva política en nuestro sitio web.`
            },
            {
              title: '9. Contacto',
              content: `Si tiene preguntas sobre esta política de privacidad, puede contactarnos en:
              
              Email: privacy@mondoexplora.com
              Dirección: MondoExplora Privacy Team`
            }
          ]
        };
      case 'fr':
        return {
          title: 'Politique de Confidentialité',
          lastUpdated: 'Dernière mise à jour : 7 octobre 2024',
          sections: [
            {
              title: '1. Informations que Nous Collectons',
              content: `Nous collectons les informations que vous nous fournissez directement, comme lorsque vous créez un compte, effectuez une réservation ou communiquez avec nous. Nous collectons également automatiquement des informations lorsque vous utilisez notre site web, notamment :
              
              • Informations de navigation (pages visitées, temps sur le site)
              • Informations sur l'appareil (type d'appareil, navigateur, adresse IP)
              • Cookies et technologies similaires
              • Données de localisation (si autorisées)`
            },
            {
              title: '2. Comment Nous Utilisons Vos Informations',
              content: `Nous utilisons vos informations pour :
              
              • Fournir et améliorer nos services
              • Traiter les réservations et transactions
              • Personnaliser votre expérience
              • Envoyer des communications marketing (avec votre consentement)
              • Analyser l'utilisation du site web
              • Respecter les obligations légales`
            },
            {
              title: '3. Cookies et Technologies de Suivi',
              content: `Nous utilisons des cookies et technologies similaires pour :
              
              • Mémoriser vos préférences
              • Analyser le trafic du site web
              • Personnaliser le contenu et les publicités
              • Mesurer l'efficacité de nos campagnes
              
              Vous pouvez contrôler les cookies via les paramètres de votre navigateur.`
            },
            {
              title: '4. Partage d\'Informations',
              content: `Nous pouvons partager vos informations avec :
              
              • Des fournisseurs de services de confiance
              • Des partenaires commerciaux (avec votre consentement)
              • Des autorités légales (lorsque requis par la loi)
              
              Nous ne vendons pas vos informations personnelles à des tiers.`
            },
            {
              title: '5. Vos Droits',
              content: `Vous avez le droit de :
              
              • Accéder à vos informations personnelles
              • Corriger les informations inexactes
              • Supprimer vos informations
              • Restreindre le traitement
              • Portabilité des données
              • Vous opposer au traitement
              
              Pour exercer ces droits, contactez-nous.`
            },
            {
              title: '6. Sécurité des Données',
              content: `Nous mettons en place des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos informations personnelles contre l'accès non autorisé, l'altération, la divulgation ou la destruction.`
            },
            {
              title: '7. Conservation des Données',
              content: `Nous conservons vos informations personnelles uniquement le temps nécessaire pour accomplir les objectifs décrits dans cette politique, sauf si la loi exige une période de conservation plus longue.`
            },
            {
              title: '8. Modifications de cette Politique',
              content: `Nous pouvons mettre à jour cette politique de confidentialité occasionnellement. Nous vous informerons des changements significatifs en publiant la nouvelle politique sur notre site web.`
            },
            {
              title: '9. Contact',
              content: `Si vous avez des questions sur cette politique de confidentialité, vous pouvez nous contacter à :
              
              Email : privacy@mondoexplora.com
              Adresse : MondoExplora Privacy Team`
            }
          ]
        };
      case 'it':
        return {
          title: 'Politica sulla Privacy',
          lastUpdated: 'Ultimo aggiornamento: 7 ottobre 2024',
          sections: [
            {
              title: '1. Informazioni che Raccogliamo',
              content: `Raccogliamo le informazioni che ci fornisci direttamente, come quando crei un account, effettui una prenotazione o comunichi con noi. Raccogliamo anche automaticamente informazioni quando utilizzi il nostro sito web, inclusi:
              
              • Informazioni di navigazione (pagine visitate, tempo sul sito)
              • Informazioni sul dispositivo (tipo di dispositivo, browser, indirizzo IP)
              • Cookie e tecnologie simili
              • Dati di localizzazione (se autorizzati)`
            },
            {
              title: '2. Come Utilizziamo le Tue Informazioni',
              content: `Utilizziamo le tue informazioni per:
              
              • Fornire e migliorare i nostri servizi
              • Elaborare prenotazioni e transazioni
              • Personalizzare la tua esperienza
              • Inviare comunicazioni di marketing (con il tuo consenso)
              • Analizzare l'utilizzo del sito web
              • Rispettare gli obblighi legali`
            },
            {
              title: '3. Cookie e Tecnologie di Tracciamento',
              content: `Utilizziamo cookie e tecnologie simili per:
              
              • Ricordare le tue preferenze
              • Analizzare il traffico del sito web
              • Personalizzare contenuti e annunci
              • Misurare l'efficacia delle nostre campagne
              
              Puoi controllare i cookie tramite le impostazioni del tuo browser.`
            },
            {
              title: '4. Condivisione di Informazioni',
              content: `Possiamo condividere le tue informazioni con:
              
              • Fornitori di servizi fidati
              • Partner commerciali (con il tuo consenso)
              • Autorità legali (quando richiesto dalla legge)
              
              Non vendiamo le tue informazioni personali a terze parti.`
            },
            {
              title: '5. I Tuoi Diritti',
              content: `Hai il diritto di:
              
              • Accedere alle tue informazioni personali
              • Correggere informazioni inesatte
              • Eliminare le tue informazioni
              • Limitare l'elaborazione
              • Portabilità dei dati
              • Opporti all'elaborazione
              
              Per esercitare questi diritti, contattaci.`
            },
            {
              title: '6. Sicurezza dei Dati',
              content: `Implementiamo misure di sicurezza tecniche e organizzative appropriate per proteggere le tue informazioni personali da accesso non autorizzato, alterazione, divulgazione o distruzione.`
            },
            {
              title: '7. Conservazione dei Dati',
              content: `Conserviamo le tue informazioni personali solo per il tempo necessario per raggiungere gli scopi descritti in questa politica, a meno che la legge non richieda un periodo di conservazione più lungo.`
            },
            {
              title: '8. Modifiche a questa Politica',
              content: `Possiamo aggiornare questa politica sulla privacy occasionalmente. Ti informeremo sui cambiamenti significativi pubblicando la nuova politica sul nostro sito web.`
            },
            {
              title: '9. Contatto',
              content: `Se hai domande su questa politica sulla privacy, puoi contattarci a:
              
              Email: privacy@mondoexplora.com
              Indirizzo: MondoExplora Privacy Team`
            }
          ]
        };
      default:
        return {
          title: 'Privacy Policy',
          lastUpdated: 'Last updated: October 7, 2024',
          sections: [
            {
              title: '1. Information We Collect',
              content: `We collect information you provide directly to us, such as when you create an account, make a booking, or communicate with us. We also automatically collect information when you use our website, including:
              
              • Browsing information (pages visited, time on site)
              • Device information (device type, browser, IP address)
              • Cookies and similar technologies
              • Location data (if permitted)`
            },
            {
              title: '2. How We Use Your Information',
              content: `We use your information to:
              
              • Provide and improve our services
              • Process bookings and transactions
              • Personalize your experience
              • Send marketing communications (with your consent)
              • Analyze website usage
              • Comply with legal obligations`
            },
            {
              title: '3. Cookies and Tracking Technologies',
              content: `We use cookies and similar technologies to:
              
              • Remember your preferences
              • Analyze website traffic
              • Personalize content and ads
              • Measure campaign effectiveness
              
              You can control cookies through your browser settings.`
            },
            {
              title: '4. Information Sharing',
              content: `We may share your information with:
              
              • Trusted service providers
              • Business partners (with your consent)
              • Legal authorities (when required by law)
              
              We do not sell your personal information to third parties.`
            },
            {
              title: '5. Your Rights',
              content: `You have the right to:
              
              • Access your personal information
              • Correct inaccurate information
              • Delete your information
              • Restrict processing
              • Data portability
              • Object to processing
              
              To exercise these rights, please contact us.`
            },
            {
              title: '6. Data Security',
              content: `We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.`
            },
            {
              title: '7. Data Retention',
              content: `We retain your personal information only for as long as necessary to fulfill the purposes described in this policy, unless the law requires a longer retention period.`
            },
            {
              title: '8. Changes to This Policy',
              content: `We may update this privacy policy occasionally. We will notify you of significant changes by posting the new policy on our website.`
            },
            {
              title: '9. Contact',
              content: `If you have questions about this privacy policy, you can contact us at:
              
              Email: privacy@mondoexplora.com
              Address: MondoExplora Privacy Team`
            }
          ]
        };
    }
  };

  const content = getContent();

  return (
    <div className="privacy-page">
      <div className="container">
        <h1>{content.title}</h1>
        <p className="last-updated">{content.lastUpdated}</p>
        
        {content.sections.map((section, index) => (
          <section key={index} className="privacy-section">
            <h2>{section.title}</h2>
            <div className="privacy-content">
              {section.content.split('\n').map((paragraph, pIndex) => (
                <p key={pIndex}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}

        {/* Consent box */}
        <ConsentBox lang={lang} redirectUrl={acceptUrl} />
      </div>
    </div>
  );
}
import ConsentBox from '@/components/PrivacyConsentBox';
