import type { Metadata } from "next";
import { trackingManager } from "@/lib/trackingManager";
import PrivacyConsentBox from "@/components/PrivacyConsentBox";

export const metadata: Metadata = {
  title: "Privacy Policy - MondoExplora",
  description: "Learn how MondoExplora collects, uses, and protects your personal information. GDPR compliant privacy policy.",
  robots: {
    index: true,
    follow: true,
  },
};

interface PrivacyPageProps {
  params: {
    lang: string;
  };
}

export default function PrivacyPage({ params }: PrivacyPageProps) {
  const { lang } = params;

  const getContent = () => {
    switch (lang) {
      case 'es':
        return {
          title: 'Política de Privacidad',
          lastUpdated: 'Última actualización: 16 de enero de 2025',
          sections: [
            {
              title: '1. Información que Recopilamos',
              content: 'Recopilamos información personal cuando usted utiliza nuestro sitio web, incluyendo:'
            },
            {
              title: '2. Cómo Utilizamos su Información',
              content: 'Utilizamos su información personal para:'
            },
            {
              title: '3. Cookies y Tecnologías de Seguimiento',
              content: 'Utilizamos cookies y tecnologías similares para mejorar su experiencia.'
            },
            {
              title: '4. Google Analytics y Marketing',
              content: 'Utilizamos Google Analytics y herramientas de marketing para análisis y publicidad.'
            },
            {
              title: '5. Sus Derechos',
              content: 'Tiene derecho a acceder, rectificar o eliminar sus datos personales.'
            }
          ]
        };
      case 'fr':
        return {
          title: 'Politique de Confidentialité',
          lastUpdated: 'Dernière mise à jour: 16 janvier 2025',
          sections: [
            {
              title: '1. Informations que nous Collectons',
              content: 'Nous collectons des informations personnelles lorsque vous utilisez notre site web.'
            },
            {
              title: '2. Comment nous Utilisons vos Informations',
              content: 'Nous utilisons vos informations personnelles pour:'
            },
            {
              title: '3. Cookies et Technologies de Suivi',
              content: 'Nous utilisons des cookies et technologies similaires pour améliorer votre expérience.'
            },
            {
              title: '4. Google Analytics et Marketing',
              content: 'Nous utilisons Google Analytics et outils de marketing pour analyse et publicité.'
            },
            {
              title: '5. Vos Droits',
              content: 'Vous avez le droit d\'accéder, rectifier ou supprimer vos données personnelles.'
            }
          ]
        };
      case 'it':
        return {
          title: 'Politica sulla Privacy',
          lastUpdated: 'Ultimo aggiornamento: 16 gennaio 2025',
          sections: [
            {
              title: '1. Informazioni che Raccogliamo',
              content: 'Raccogliamo informazioni personali quando utilizzi il nostro sito web.'
            },
            {
              title: '2. Come Utilizziamo le Tue Informazioni',
              content: 'Utilizziamo le tue informazioni personali per:'
            },
            {
              title: '3. Cookie e Tecnologie di Tracciamento',
              content: 'Utilizziamo cookie e tecnologie simili per migliorare la tua esperienza.'
            },
            {
              title: '4. Google Analytics e Marketing',
              content: 'Utilizziamo Google Analytics e strumenti di marketing per analisi e pubblicità.'
            },
            {
              title: '5. I Tuoi Diritti',
              content: 'Hai il diritto di accedere, rettificare o eliminare i tuoi dati personali.'
            }
          ]
        };
      default:
        return {
          title: 'Privacy Policy',
          lastUpdated: 'Last updated: January 16, 2025',
          sections: [
            {
              title: '1. Information We Collect',
              content: 'We collect personal information when you use our website, including:'
            },
            {
              title: '2. How We Use Your Information',
              content: 'We use your personal information to:'
            },
            {
              title: '3. Cookies and Tracking Technologies',
              content: 'We use cookies and similar technologies to improve your experience.'
            },
            {
              title: '4. Google Analytics and Marketing',
              content: 'We use Google Analytics and marketing tools for analysis and advertising.'
            },
            {
              title: '5. Your Rights',
              content: 'You have the right to access, rectify, or delete your personal data.'
            }
          ]
        };
    }
  };

  const content = getContent();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{content.title}</h1>
          <p className="text-gray-600 mb-8">{content.lastUpdated}</p>
          
          <div className="prose prose-lg max-w-none">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                At MondoExplora, we are committed to protecting your privacy and personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you visit our website mondoexplora.com.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect personal information when you use our website, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Contact information (email address, name)</li>
                <li>Usage data (pages visited, time spent, clicks)</li>
                <li>Device information (browser type, IP address, device type)</li>
                <li>Location data (country, city based on IP)</li>
                <li>Search queries and preferences</li>
                <li>Cookies and tracking technologies data</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use your personal information to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Provide and improve our hotel booking services</li>
                <li>Personalize your experience and recommendations</li>
                <li>Process transactions and bookings</li>
                <li>Send you relevant travel offers and updates</li>
                <li>Analyze website performance and user behavior</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for website functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use our site</li>
                <li><strong>Marketing Cookies:</strong> Used for personalized advertising</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and choices</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Google Analytics and Marketing Tools</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the following tracking and analytics tools:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Google Analytics 4:</strong> Website traffic analysis and user behavior tracking</li>
                <li><strong>Google Tag Manager:</strong> Managing tracking codes and marketing pixels</li>
                <li><strong>Google Ads:</strong> Conversion tracking for advertising campaigns</li>
                <li><strong>Facebook Pixel:</strong> Social media advertising and retargeting</li>
                <li><strong>Microsoft Clarity:</strong> User session recordings and heatmaps</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                These tools help us improve our services, provide relevant advertisements, 
                and measure the effectiveness of our marketing campaigns.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Sharing and Third Parties</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may share your information with:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Hotel booking partners and affiliates</li>
                <li>Payment processors for transaction handling</li>
                <li>Analytics providers (Google, Facebook, Microsoft)</li>
                <li>Legal authorities when required by law</li>
                <li>Service providers who assist in our operations</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Your Rights (GDPR & CCPA Compliance)</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have the following rights regarding your personal data:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Receive your data in a structured format</li>
                <li><strong>Objection:</strong> Object to processing of your data</li>
                <li><strong>Restriction:</strong> Limit how we process your data</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate security measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. However, 
                no method of transmission over the internet is 100% secure.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal information only as long as necessary to fulfill the 
                purposes outlined in this Privacy Policy, unless a longer retention period 
                is required by law.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and processed in countries other than 
                your own. We ensure appropriate safeguards are in place to protect your data 
                in accordance with applicable privacy laws.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of 
                any changes by posting the new Privacy Policy on this page and updating the 
                "Last updated" date.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or wish to exercise your rights, 
                please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> privacy@mondoexplora.com</p>
                <p className="text-gray-700"><strong>Website:</strong> mondoexplora.com</p>
                <p className="text-gray-700"><strong>Address:</strong> MondoExplora Privacy Team</p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Consent Management</h3>
            <p className="text-gray-700 mb-4">
              You can manage your cookie preferences and consent at any time:
            </p>
            <PrivacyConsentBox lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
}