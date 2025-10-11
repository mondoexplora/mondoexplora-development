'use client';

import { testConversion } from './ConversionTracking';

export default function TestConversionButton() {
  const handleTestConversion = () => {
    console.log('Testing Google Ads conversion...');
    testConversion();
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={handleTestConversion}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg font-medium text-sm"
      >
        Test Conversion
      </button>
    </div>
  );
}
